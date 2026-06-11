import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import * as crypto from 'crypto';
import { Student } from '../schemas/student.schema';
import { StudentKnowledge } from '../schemas/student-knowledge.schema';
import { KnowledgeNode } from '../schemas/knowledge-node.schema';
import { Assessment } from '../schemas/assessment.schema';

@Injectable()
export class StudentService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(StudentKnowledge.name) private studentKnowledgeModel: Model<StudentKnowledge>,
    @InjectModel(KnowledgeNode.name) private knowledgeNodeModel: Model<KnowledgeNode>,
    @InjectModel(Assessment.name) private assessmentModel: Model<Assessment>,
  ) {}

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  async create(dto: CreateStudentDto) {
    const existing = await this.studentModel.findOne({ email: dto.email });

    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    const student = await this.studentModel.create({
      name: dto.name,
      email: dto.email,
      passwordHash: this.hashPassword(dto.password),
    });

    const nodes = await this.knowledgeNodeModel.find().sort({ order: 1 });

    const knowledgeDocs = nodes.map((node) => ({
      studentId: student._id,
      nodeId: node.nodeId,
      masteryLevel: 0,
      status: 'not_started',
    }));

    await this.studentKnowledgeModel.insertMany(knowledgeDocs);

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      hasCompletedAssessment: false,
    };
  }

  async login(dto: LoginStudentDto) {
    const student = await this.studentModel.findOne({ email: dto.email });

    if (!student || student.passwordHash !== this.hashPassword(dto.password)) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    const completedAssessment = await this.assessmentModel.findOne({
      studentId: student._id,
      status: 'completed'
    });

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      hasCompletedAssessment: !!completedAssessment,
    };
  }

  async findById(id: string) {
    const student = await this.studentModel.findById(id);

    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
    };
  }

  async getProgress(studentId: string) {
    const student = await this.findById(studentId);

    // Mongoose: find knowledges and manually join nodes or use a lookup, but here we can just query both
    const knowledges = await this.studentKnowledgeModel.find({ studentId });
    const nodes = await this.knowledgeNodeModel.find();
    
    // Merge them in memory (since we don't have true foreign key refs to KnowledgeNode's ObjectID, we link by nodeId string)
    const knowledgesWithNodes = knowledges.map(k => {
      const node = nodes.find(n => n.nodeId === k.nodeId);
      return { ...k.toObject(), node };
    }).sort((a, b) => (a.node?.order || 0) - (b.node?.order || 0));

    const totalMastery = knowledgesWithNodes.reduce((sum, k) => sum + k.masteryLevel, 0);
    const overallProgress = knowledgesWithNodes.length > 0 ? totalMastery / knowledgesWithNodes.length : 0;

    const totalExercises = knowledgesWithNodes.reduce((sum, k) => sum + k.exercisesCount, 0);
    const totalCorrect = knowledgesWithNodes.reduce((sum, k) => sum + k.correctCount, 0);

    const currentConcept = knowledgesWithNodes.find(
      (k) => k.status === 'in_progress' || k.status === 'not_started',
    );

    return {
      student,
      overallProgress: Math.round(overallProgress * 100) / 100,
      currentConcept: currentConcept
        ? { id: currentConcept.nodeId, label: currentConcept.node?.label, mastery: currentConcept.masteryLevel }
        : null,
      totalExercises,
      totalCorrect,
      successRate: totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0,
      concepts: knowledgesWithNodes.map((k) => ({
        nodeId: k.nodeId,
        label: k.node?.label,
        category: k.node?.category,
        masteryLevel: k.masteryLevel,
        status: k.status,
        exercisesCount: k.exercisesCount,
        correctCount: k.correctCount,
      })),
    };
  }

  async updateMastery(
    studentId: string,
    nodeId: string,
    event: 'correct' | 'incorrect' | 'correct_with_hint',
  ) {
    const knowledge = await this.studentKnowledgeModel.findOne({ studentId, nodeId });

    if (!knowledge) {
      throw new NotFoundException('Conhecimento do aluno não encontrado');
    }

    let delta = 0;
    let correctIncrement = 0;
    let hintIncrement = 0;

    switch (event) {
      case 'correct':
        delta = 20;
        correctIncrement = 1;
        break;
      case 'incorrect':
        delta = -10;
        break;
      case 'correct_with_hint':
        delta = 10;
        correctIncrement = 1;
        hintIncrement = 1;
        break;
    }

    const newMastery = Math.max(0, Math.min(100, knowledge.masteryLevel + delta));
    const newExercises = knowledge.exercisesCount + 1;
    const newCorrect = knowledge.correctCount + correctIncrement;

    // Determine status
    let status = 'in_progress';
    if (newMastery >= 80) {
      status = 'mastered';
    } else if (newMastery < 40 && newExercises > 3) {
      status = 'struggling';
    } else if (newMastery === 0 && newExercises === 0) {
      status = 'not_started';
    }

    knowledge.masteryLevel = newMastery;
    knowledge.status = status;
    knowledge.exercisesCount = newExercises;
    knowledge.correctCount = newCorrect;
    knowledge.hintCount = knowledge.hintCount + hintIncrement;

    await knowledge.save();

    const node = await this.knowledgeNodeModel.findOne({ nodeId });

    return {
      nodeId: knowledge.nodeId,
      label: node?.label,
      masteryLevel: knowledge.masteryLevel,
      status: knowledge.status,
      exercisesCount: knowledge.exercisesCount,
    };
  }
}
