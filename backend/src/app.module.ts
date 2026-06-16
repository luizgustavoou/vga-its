import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import { StudentModule } from './student/student.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { AssessmentModule } from './assessment/assessment.module';
import { ChatModule } from './chat/chat.module';
import { LlmModule } from './llm/llm.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL || 'mongodb://localhost:27017/vga_its'),
    StudentModule,
    KnowledgeModule,
    AssessmentModule,
    ChatModule,
    LlmModule,
  ],
})
export class AppModule {}
