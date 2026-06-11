import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeNode, KnowledgeNodeSchema } from '../schemas/knowledge-node.schema';
import { StudentKnowledge, StudentKnowledgeSchema } from '../schemas/student-knowledge.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: KnowledgeNode.name, schema: KnowledgeNodeSchema },
      { name: StudentKnowledge.name, schema: StudentKnowledgeSchema },
    ]),
  ],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
