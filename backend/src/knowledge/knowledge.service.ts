import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { KnowledgeNode } from '../schemas/knowledge-node.schema';
import { StudentKnowledge } from '../schemas/student-knowledge.schema';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectModel(KnowledgeNode.name) private knowledgeNodeModel: Model<KnowledgeNode>,
    @InjectModel(StudentKnowledge.name) private studentKnowledgeModel: Model<StudentKnowledge>,
  ) {}

  async getGraph() {
    const nodes = await this.knowledgeNodeModel.find().sort({ order: 1 });

    return nodes.map((node) => ({
      id: node.nodeId,
      label: node.label,
      description: node.description,
      order: node.order,
      category: node.category,
      prerequisites: node.prerequisites || [],
    }));
  }

  async getStudentGraph(studentId: string) {
    const nodes = await this.knowledgeNodeModel.find().sort({ order: 1 });
    const knowledges = await this.studentKnowledgeModel.find({ studentId: new Types.ObjectId(studentId) });

    return nodes.map((node) => {
      const knowledge = knowledges.find(k => k.nodeId === node.nodeId);
      return {
        id: node.nodeId,
        label: node.label,
        description: node.description,
        order: node.order,
        category: node.category,
        prerequisites: node.prerequisites || [],
        masteryLevel: knowledge?.masteryLevel ?? 0,
        status: knowledge?.status ?? 'not_started',
        exercisesCount: knowledge?.exercisesCount ?? 0,
        correctCount: knowledge?.correctCount ?? 0,
      };
    });
  }
}
