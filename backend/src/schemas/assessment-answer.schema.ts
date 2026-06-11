import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'answeredAt', updatedAt: false } })
export class AssessmentAnswer extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AssessmentQuestion', required: true })
  questionId: Types.ObjectId;

  @Prop({ required: true })
  studentAnswer: string;

  @Prop({ required: true })
  isCorrect: boolean;

  answeredAt: Date;
}

export const AssessmentAnswerSchema = SchemaFactory.createForClass(AssessmentAnswer);
