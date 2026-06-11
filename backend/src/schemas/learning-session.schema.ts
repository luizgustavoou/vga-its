import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: 'startedAt', updatedAt: false } })
export class LearningSession extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId;

  @Prop({ required: true })
  currentNodeId: string;

  @Prop({ default: 'active' })
  status: string; // active | completed

  @Prop()
  endedAt?: Date;

  startedAt: Date;
}

export const LearningSessionSchema = SchemaFactory.createForClass(LearningSession);
