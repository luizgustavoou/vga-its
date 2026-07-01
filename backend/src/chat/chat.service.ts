import { Injectable, NotFoundException, Logger } from '@nestjs/common';
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

  /**
   * Parses the raw LLM response (expected to be JSON) and extracts the
   * `message` and `evaluation` fields. Multiple fallback strategies are
   * applied because the Gemini API occasionally returns:
   *  - JSON wrapped inside markdown code fences (```json ... ```)
   *  - Double-escaped unicode sequences (\\ud83d instead of \ud83d)
   *  - Slightly malformed JSON that standard JSON.parse rejects
   */
  private parseLlmResponse(raw: string): { message: string; evaluation: string } {
    const fallback = { message: raw, evaluation: 'none' };

    if (!raw || !raw.trim()) return fallback;

    // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
    let cleaned = raw.trim();
    const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenceMatch) {
      cleaned = fenceMatch[1].trim();
    }

    // 2. Try standard JSON.parse
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed && typeof parsed.message === 'string') {
        return {
          message: parsed.message || raw,
          evaluation: typeof parsed.evaluation === 'string' ? parsed.evaluation : 'none',
        };
      }
    } catch (_) {
      // fall through to next strategy
    }

    // 3. Regex extraction as last resort — grab the value of "message" key
    const msgMatch = cleaned.match(/"message"\s*:\s*"([\s\S]*?)(?<!\\)",/);
    if (msgMatch) {
      try {
        // Re-parse just the string value so escape sequences are handled
        const messageValue = JSON.parse(`"${msgMatch[1]}"`);
        const evalMatch = cleaned.match(/"evaluation"\s*:\s*"([^"]+)"/);
        return {
          message: messageValue,
          evaluation: evalMatch ? evalMatch[1] : 'none',
        };
      } catch (_) {
        // fall through
      }
    }

    this.logger.error(`Could not parse LLM JSON response, using raw text. Raw: ${raw.slice(0, 200)}`);
    return fallback;
  }

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

    const { message: greeting } = this.parseLlmResponse(rawGreeting);

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
    const { message: parsedMessage, evaluation } = this.parseLlmResponse(rawResponse);

    // Prevent returning just "{}" if generation was weird
    const responseText = parsedMessage === '{}' ? 'Entendi! Poderia me detalhar um pouco mais?' : parsedMessage;

    this.logger.log(`LLM avaliou a resposta como: ${evaluation}`);
    this.logger.debug(`Resposta gerada pelo LLM: ${responseText}`);

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
