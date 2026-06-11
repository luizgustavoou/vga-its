import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class KnowledgeNode extends Document {
  @Prop({ type: String, required: true, unique: true })
  nodeId: string;

  @Prop({ type: String, required: true })
  label: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: [String], default: [] })
  prerequisites: string[];
}

export const KnowledgeNodeSchema = SchemaFactory.createForClass(KnowledgeNode);
