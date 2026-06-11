import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentController } from './assessment.controller';
import { AssessmentService } from './assessment.service';
import { Assessment, AssessmentSchema } from '../schemas/assessment.schema';
import { AssessmentQuestion, AssessmentQuestionSchema } from '../schemas/assessment-question.schema';
import { AssessmentAnswer, AssessmentAnswerSchema } from '../schemas/assessment-answer.schema';
import { StudentKnowledge, StudentKnowledgeSchema } from '../schemas/student-knowledge.schema';
import { Student, StudentSchema } from '../schemas/student.schema';
import { KnowledgeNode, KnowledgeNodeSchema } from '../schemas/knowledge-node.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Assessment.name, schema: AssessmentSchema },
      { name: AssessmentQuestion.name, schema: AssessmentQuestionSchema },
      { name: AssessmentAnswer.name, schema: AssessmentAnswerSchema },
      { name: StudentKnowledge.name, schema: StudentKnowledgeSchema },
      { name: Student.name, schema: StudentSchema },
      { name: KnowledgeNode.name, schema: KnowledgeNodeSchema },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
