import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { Student, StudentSchema } from '../schemas/student.schema';
import { StudentKnowledge, StudentKnowledgeSchema } from '../schemas/student-knowledge.schema';
import { KnowledgeNode, KnowledgeNodeSchema } from '../schemas/knowledge-node.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Student.name, schema: StudentSchema },
      { name: StudentKnowledge.name, schema: StudentKnowledgeSchema },
      { name: KnowledgeNode.name, schema: KnowledgeNodeSchema },
    ]),
  ],
  controllers: [StudentController],
  providers: [StudentService],
  exports: [StudentService],
})
export class StudentModule {}
