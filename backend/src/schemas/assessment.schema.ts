import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'startedAt', updatedAt: false } })
export class Assessment extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ default: 'in_progress' })
  status: string;

  @Prop()
  completedAt?: Date;

  startedAt: Date;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
