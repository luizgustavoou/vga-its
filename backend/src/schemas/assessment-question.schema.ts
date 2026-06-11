import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class AssessmentQuestion extends Document {
  @Prop({ type: String, required: true })
  questionId: string;

  @Prop({ type: String, required: true })
  nodeId: string;

  @Prop({ type: String, required: true })
  questionText: string;

  @Prop({ type: String, required: true })
  options: string;

  @Prop({ type: String, required: true })
  correctAnswer: string;

  @Prop({ type: Number, default: 1 })
  difficulty: number;
}

export const AssessmentQuestionSchema = SchemaFactory.createForClass(AssessmentQuestion);
