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
            ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } }
            : undefined,
        serializers: {
          req(req) {
            return {
              method: req.method,
              url: req.url,
              params: req.params,
              query: req.query,
              body: req.body,
            };
          },

          res(res) {
            return {
              statusCode: res.statusCode,
              responseTime: res.responseTime,
            };
          },

          err(err) {
            return {
              type: err.name,
              message: err.message,
              stack: err.stack,
            };
          },
        },
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
export class AppModule { }
