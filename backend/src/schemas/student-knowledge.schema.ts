import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Student } from './student.schema';

@Schema({ timestamps: true })
export class StudentKnowledge extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  nodeId: string;

  @Prop({ default: 0 })
  masteryLevel: number;

  @Prop({ default: 'not_started' })
  status: string;

  @Prop({ default: 0 })
  exercisesCount: number;

  @Prop({ default: 0 })
  correctCount: number;

  @Prop({ default: 0 })
  hintCount: number;
}

export const StudentKnowledgeSchema = SchemaFactory.createForClass(StudentKnowledge);
StudentKnowledgeSchema.index({ studentId: 1, nodeId: 1 }, { unique: true });
