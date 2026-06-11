import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { LlmModule } from '../llm/llm.module';
import { LearningSession, LearningSessionSchema } from '../schemas/learning-session.schema';
import { ChatMessage, ChatMessageSchema } from '../schemas/chat-message.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { KnowledgeNode, KnowledgeNodeSchema } from '../schemas/knowledge-node.schema';
import { StudentKnowledge, StudentKnowledgeSchema } from '../schemas/student-knowledge.schema';
import { StudentModule } from '../student/student.module';

@Module({
  imports: [
    LlmModule,
    StudentModule,
    MongooseModule.forFeature([
      { name: LearningSession.name, schema: LearningSessionSchema },
      { name: ChatMessage.name, schema: ChatMessageSchema },
      { name: Student.name, schema: StudentSchema },
      { name: KnowledgeNode.name, schema: KnowledgeNodeSchema },
      { name: StudentKnowledge.name, schema: StudentKnowledgeSchema },
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
