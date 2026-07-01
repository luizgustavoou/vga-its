import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LlmService } from '../llm/llm.service';
import { buildTutorPrompt } from './prompts/tutor-prompt';
import { LearningSession } from '../schemas/learning-session.schema';
import { ChatMessage } from '../schemas/chat-message.schema';
import { Student } from '../schemas/student.schema';
import { KnowledgeNode } from '../schemas/knowledge-node.schema';
import { StudentKnowledge } from '../schemas/student-knowledge.schema';
import { StudentService } from '../student/student.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(LearningSession.name) private learningSessionModel: Model<LearningSession>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(KnowledgeNode.name) private knowledgeNodeModel: Model<KnowledgeNode>,
    @InjectModel(StudentKnowledge.name) private studentKnowledgeModel: Model<StudentKnowledge>,
    private llmService: LlmService,
    private studentService: StudentService,
  ) {}

  async createSession(studentId: string, nodeId: string) {
    const student = await this.studentModel.findById(studentId);
    if (!student) throw new NotFoundException('Aluno não encontrado');

    const node = await this.knowledgeNodeModel.findOne({ nodeId });
    if (!node) throw new NotFoundException('Conceito não encontrado');

    // ── Prerequisite Gate (Skinner's prerequisite mastery) ──────────────────
    if (node.prerequisites && node.prerequisites.length > 0) {
      const prereqKnowledges = await this.studentKnowledgeModel.find({
        studentId: new Types.ObjectId(studentId),
        nodeId: { $in: node.prerequisites },
      });

      const masteredSet = new Set(
        prereqKnowledges.filter(k => k.status === 'mastered').map(k => k.nodeId)
      );

      const unmetPrereqs = node.prerequisites.filter(p => !masteredSet.has(p));

      if (unmetPrereqs.length > 0) {
        // Resolve labels for unmet prerequisites to show in the error message
        const unmetNodes = await this.knowledgeNodeModel.find({ nodeId: { $in: unmetPrereqs } });
        const unmetLabels = unmetNodes.map(n => n.label).join(', ');
        throw new ForbiddenException(
          `Você precisa dominar os seguintes conceitos antes: ${unmetLabels}`
        );
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    let session = await this.learningSessionModel.findOneAndUpdate(
      { studentId: new Types.ObjectId(studentId), currentNodeId: nodeId },
      { $set: { status: 'active' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Close any other active sessions
    await this.learningSessionModel.updateMany(
      { 
        studentId: new Types.ObjectId(studentId), 
        _id: { $ne: session._id },
        status: 'active' 
      },
      { $set: { status: 'completed', endedAt: new Date() } }
    );

    const messages = await this.getSessionMessages(session._id.toString());
    if (messages.length > 0) {
      return {
        sessionId: session._id.toString(),
        nodeId: node.nodeId,
        nodeLabel: node.label,
        messages,
      };
    }

    const knowledge = await this.studentKnowledgeModel.findOne({ studentId: new Types.ObjectId(studentId), nodeId });

    const allKnowledges = await this.studentKnowledgeModel.find({ studentId: new Types.ObjectId(studentId) });
    const allNodes = await this.knowledgeNodeModel.find();

    const knowledgesWithNodes = allKnowledges.map(k => ({
      ...k.toObject(),
      node: allNodes.find(n => n.nodeId === k.nodeId)
    })).sort((a, b) => (a.node?.order || 0) - (b.node?.order || 0));

    const systemPrompt = buildTutorPrompt({
      studentName: student.name,
      currentConcept: node.label,
      conceptDescription: node.description,
      masteryLevel: knowledge?.masteryLevel ?? 0,
      masteredConcepts: knowledgesWithNodes
        .filter((k) => k.status === 'mastered' && k.node)
        .map((k) => k.node!.label),
      pendingConcepts: knowledgesWithNodes
        .filter((k) => k.status !== 'mastered' && k.node)
        .map((k) => k.node!.label),
    });

    await this.chatMessageModel.create({
      sessionId: session._id,
      role: 'system',
      content: systemPrompt,
    });

    const rawGreeting = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Olá! Estou pronto para estudar ${node.label}. Pode me apresentar o conceito?`,
      },
    ], 'json');

    let greeting = rawGreeting;
    try {
      const parsed = JSON.parse(rawGreeting);
      greeting = parsed.message || rawGreeting;
    } catch (e) {}

    await this.chatMessageModel.create({
      sessionId: session._id,
      role: 'assistant',
      content: greeting,
    });

    const initialMessages = await this.getSessionMessages(session._id.toString());

    return {
      sessionId: session._id.toString(),
      nodeId: node.nodeId,
      nodeLabel: node.label,
      messages: initialMessages,
    };
  }

  async sendMessage(sessionId: string, content: string) {
    const session = await this.learningSessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Sessão não encontrada');

    this.logger.log(`Nova mensagem recebida na sessão ${sessionId}. Estudante: ${session.studentId}, Conceito: ${session.currentNodeId}`);

    await this.chatMessageModel.create({
      sessionId: new Types.ObjectId(sessionId),
      role: 'user',
      content,
    });

    const messages = await this.chatMessageModel.find({ sessionId: new Types.ObjectId(sessionId) }).sort({ createdAt: 1 });

    const llmMessages = messages.map((m) => {
      let content = m.content;
      if (m.role === 'assistant') {
        content = JSON.stringify({ message: m.content, evaluation: 'none' });
      }
      return {
        role: m.role,
        content,
      };
    });

    const rawResponse = await this.llmService.chat(llmMessages, 'json');
    let responseText = rawResponse;
    let evaluation = 'none';

    try {
      const parsed = JSON.parse(rawResponse);
      if (parsed.message) responseText = parsed.message;
      if (parsed.evaluation) evaluation = parsed.evaluation;
      
      // Prevent returning just "{}" if generation was weird
      if (responseText === '{}') responseText = 'Entendi! Poderia me detalhar um pouco mais?';

      this.logger.log(`LLM avaliou a resposta como: ${evaluation}`);
      this.logger.debug(`Resposta gerada pelo LLM: ${responseText}`);
    } catch (e) {
      this.logger.error(`Falha ao parsear JSON do LLM: ${rawResponse}`, e);
    }

    let updatedMastery: number | undefined;

    if (['correct', 'incorrect', 'correct_with_hint'].includes(evaluation)) {
      this.logger.log(`Chamando studentService.updateMastery para evento: ${evaluation}`);
      const masteryResult = await this.studentService.updateMastery(
        session.studentId.toString(),
        session.currentNodeId,
        evaluation as 'correct' | 'incorrect' | 'correct_with_hint'
      );
      updatedMastery = masteryResult.masteryLevel;
      this.logger.log(`Novo nível de proficiência retornado: ${updatedMastery}`);
    } else {
      this.logger.log(`Nenhuma atualização de proficiência necessária para a avaliação: ${evaluation}`);
    }

    await this.chatMessageModel.create({
      sessionId: new Types.ObjectId(sessionId),
      role: 'assistant',
      content: responseText,
    });

    return {
      role: 'assistant',
      content: responseText,
      sessionId,
      updatedMastery,
    };
  }

  async getSessionMessages(sessionId: string) {
    const messages = await this.chatMessageModel.find({ sessionId: new Types.ObjectId(sessionId) }).sort({ createdAt: 1 });

    return messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        id: m._id.toString(),
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      }));
  }

  async getStudentSessions(studentId: string) {
    const sessions = await this.learningSessionModel.find({ studentId: new Types.ObjectId(studentId) }).sort({ startedAt: -1 });
    const nodes = await this.knowledgeNodeModel.find();

    return sessions.map((s) => {
      const node = nodes.find(n => n.nodeId === s.currentNodeId);
      return {
        id: s._id.toString(),
        nodeId: s.currentNodeId,
        nodeLabel: node?.label || s.currentNodeId,
        status: s.status,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
      };
    });
  }
}
