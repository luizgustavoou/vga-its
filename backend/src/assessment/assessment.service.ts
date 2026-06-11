import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Assessment } from '../schemas/assessment.schema';
import { AssessmentQuestion } from '../schemas/assessment-question.schema';
import { AssessmentAnswer } from '../schemas/assessment-answer.schema';
import { StudentKnowledge } from '../schemas/student-knowledge.schema';
import { Student } from '../schemas/student.schema';
import { KnowledgeNode } from '../schemas/knowledge-node.schema';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectModel(Assessment.name) private assessmentModel: Model<Assessment>,
    @InjectModel(AssessmentQuestion.name) private assessmentQuestionModel: Model<AssessmentQuestion>,
    @InjectModel(AssessmentAnswer.name) private assessmentAnswerModel: Model<AssessmentAnswer>,
    @InjectModel(StudentKnowledge.name) private studentKnowledgeModel: Model<StudentKnowledge>,
    @InjectModel(Student.name) private studentModel: Model<Student>,
    @InjectModel(KnowledgeNode.name) private knowledgeNodeModel: Model<KnowledgeNode>,
  ) {}

  async start(studentId: string) {
    const student = await this.studentModel.findById(studentId);
    if (!student) {
      throw new NotFoundException('Aluno não encontrado');
    }

    const existing = await this.assessmentModel.findOne({
      studentId: new Types.ObjectId(studentId),
    }).sort({ createdAt: -1 });

    if (existing) {
      return this.getAssessmentWithQuestions(existing._id.toString());
    }

    const assessment = await this.assessmentModel.create({
      studentId: new Types.ObjectId(studentId),
    });

    return this.getAssessmentWithQuestions(assessment._id.toString());
  }

  async getAssessmentWithQuestions(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    const answers = await this.assessmentAnswerModel.find({ assessmentId: new Types.ObjectId(assessmentId) });
    const allQuestions = await this.assessmentQuestionModel.find();
    const nodes = await this.knowledgeNodeModel.find();

    const questionsWithNodes = allQuestions.map(q => ({
      ...q.toObject(),
      node: nodes.find(n => n.nodeId === q.nodeId)
    })).sort((a, b) => (a.node?.order || 0) - (b.node?.order || 0));

    const answeredQuestionIds = answers.map((a) => a.questionId.toString());
    const nextQuestion = questionsWithNodes.find((q) => !answeredQuestionIds.includes(q._id.toString()));

    return {
      id: assessment._id.toString(),
      status: assessment.status,
      totalQuestions: allQuestions.length,
      answeredCount: answers.length,
      currentQuestion: nextQuestion
        ? {
            id: nextQuestion._id.toString(),
            nodeId: nextQuestion.nodeId,
            conceptLabel: nextQuestion.node?.label,
            questionText: nextQuestion.questionText,
            options: JSON.parse(nextQuestion.options),
            difficulty: nextQuestion.difficulty,
          }
        : null,
    };
  }

  async answer(assessmentId: string, questionId: string, studentAnswer: string) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Avaliação não encontrada');
    }
    if (assessment.status === 'completed') {
      throw new BadRequestException('Avaliação já finalizada');
    }

    const question = await this.assessmentQuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundException('Questão não encontrada');
    }

    const existingAnswer = await this.assessmentAnswerModel.findOne({
      assessmentId: new Types.ObjectId(assessmentId),
      questionId: new Types.ObjectId(questionId),
    });
    if (existingAnswer) {
      throw new BadRequestException('Questão já respondida');
    }

    const isCorrect = studentAnswer === question.correctAnswer;

    await this.assessmentAnswerModel.create({
      assessmentId: new Types.ObjectId(assessmentId),
      questionId: new Types.ObjectId(questionId),
      studentAnswer,
      isCorrect,
    });

    return {
      isCorrect,
      correctAnswer: question.correctAnswer,
      ...(await this.getAssessmentWithQuestions(assessmentId)),
    };
  }

  async finish(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Avaliação não encontrada');
    }

    const answers = await this.assessmentAnswerModel.find({ assessmentId: new Types.ObjectId(assessmentId) });
    const questions = await this.assessmentQuestionModel.find({ _id: { $in: answers.map(a => a.questionId) } });

    const conceptResults: Record<string, { correct: number; total: number }> = {};

    for (const answer of answers) {
      const q = questions.find(q => q._id.toString() === answer.questionId.toString());
      if (q) {
        if (!conceptResults[q.nodeId]) conceptResults[q.nodeId] = { correct: 0, total: 0 };
        conceptResults[q.nodeId].total++;
        if (answer.isCorrect) conceptResults[q.nodeId].correct++;
      }
    }

    for (const [nodeId, result] of Object.entries(conceptResults)) {
      const mastery = Math.round((result.correct / result.total) * 100);
      let status = 'not_started';
      if (mastery >= 80) status = 'mastered';
      else if (mastery > 0) status = 'in_progress';

      const existingKnowledge = await this.studentKnowledgeModel.findOne({
        studentId: assessment.studentId,
        nodeId,
      });

      if (existingKnowledge) {
        existingKnowledge.masteryLevel = mastery;
        existingKnowledge.status = status;
        await existingKnowledge.save();
      } else {
        await this.studentKnowledgeModel.create({
          studentId: assessment.studentId,
          nodeId,
          masteryLevel: mastery,
          status,
        });
      }
    }

    assessment.status = 'completed';
    assessment.completedAt = new Date();
    await assessment.save();

    return this.getResult(assessmentId);
  }

  async getResult(assessmentId: string) {
    const assessment = await this.assessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('Avaliação não encontrada');
    }
    const student = await this.studentModel.findById(assessment.studentId);

    const answers = await this.assessmentAnswerModel.find({ assessmentId: new Types.ObjectId(assessmentId) });
    const questions = await this.assessmentQuestionModel.find({ _id: { $in: answers.map(a => a.questionId) } });
    const nodes = await this.knowledgeNodeModel.find().sort({ order: 1 });

    const conceptMap: Record<string, { label: string; correct: number; total: number; category: string }> = {};

    for (const node of nodes) {
      conceptMap[node.nodeId] = { label: node.label, correct: 0, total: 0, category: node.category };
    }

    for (const answer of answers) {
      const q = questions.find(q => q._id.toString() === answer.questionId.toString());
      if (q && conceptMap[q.nodeId]) {
        conceptMap[q.nodeId].total++;
        if (answer.isCorrect) conceptMap[q.nodeId].correct++;
      }
    }

    const results = Object.entries(conceptMap).map(([nodeId, data]) => ({
      nodeId,
      label: data.label,
      category: data.category,
      correct: data.correct,
      total: data.total,
      mastery: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    }));

    return {
      assessmentId: assessment._id.toString(),
      studentName: student?.name,
      status: assessment.status,
      completedAt: assessment.completedAt,
      results,
      overallScore: results.length > 0 ? Math.round(
        results.reduce((sum, r) => sum + r.mastery, 0) / results.length,
      ) : 0,
    };
  }
}
