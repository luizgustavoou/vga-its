import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LlmService } from '../llm/llm.service';
import { buildTutorPrompt } from './prompts/tutor-prompt';
import { LearningSession } from '../schemas/learning-session.schema';
import { ChatMessage } from '../schemas/chat-message.schema';
import { Student } from '../schemas/student.schema';
import { KnowledgeNode } from '../schemas/knowledge-node.schema';
import { StudentKnowledge } from '../schemas/student-knowledge.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(LearningSession.name) private learningSessionModel: Model<LearningSession>,
    @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessage>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(KnowledgeNode.name) private knowledgeNodeModel: Model<KnowledgeNode>,
    @InjectModel(StudentKnowledge.name) private studentKnowledgeModel: Model<StudentKnowledge>,
    private llmService: LlmService,
  ) {}

  async createSession(studentId: string, nodeId: string) {
    const student = await this.studentModel.findById(studentId);
    if (!student) throw new NotFoundException('Aluno não encontrado');

    const node = await this.knowledgeNodeModel.findOne({ nodeId });
    if (!node) throw new NotFoundException('Conceito não encontrado');

    // Close any active sessions
    await this.learningSessionModel.updateMany(
      { studentId: new Types.ObjectId(studentId), status: 'active' },
      { $set: { status: 'completed', endedAt: new Date() } }
    );

    const session = await this.learningSessionModel.create({
      studentId: new Types.ObjectId(studentId),
      currentNodeId: nodeId,
    });

    const knowledge = await this.studentKnowledgeModel.findOne({ studentId, nodeId });

    const allKnowledges = await this.studentKnowledgeModel.find({ studentId });
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

    const greeting = await this.llmService.chat([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Olá! Estou pronto para estudar ${node.label}. Pode me apresentar o conceito?`,
      },
    ]);

    await this.chatMessageModel.create({
      sessionId: session._id,
      role: 'assistant',
      content: greeting,
    });

    return {
      sessionId: session._id.toString(),
      nodeId: node.nodeId,
      nodeLabel: node.label,
      greeting,
    };
  }

  async sendMessage(sessionId: string, content: string) {
    const session = await this.learningSessionModel.findById(sessionId);
    if (!session) throw new NotFoundException('Sessão não encontrada');

    await this.chatMessageModel.create({
      sessionId: new Types.ObjectId(sessionId),
      role: 'user',
      content,
    });

    const messages = await this.chatMessageModel.find({ sessionId: new Types.ObjectId(sessionId) }).sort({ createdAt: 1 });

    const llmMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.llmService.chat(llmMessages);

    await this.chatMessageModel.create({
      sessionId: new Types.ObjectId(sessionId),
      role: 'assistant',
      content: response,
    });

    return {
      role: 'assistant',
      content: response,
      sessionId,
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
