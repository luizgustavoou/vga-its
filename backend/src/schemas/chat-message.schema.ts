import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class ChatMessage extends Document {
  @Prop({ type: Types.ObjectId, ref: 'LearningSession', required: true })
  sessionId: Types.ObjectId;

  @Prop({ required: true })
  role: string; // "user" | "assistant" | "system"

  @Prop({ type: String, required: true })
  content: string;

  createdAt: Date;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
