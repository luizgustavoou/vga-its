import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { AssessmentService } from './assessment.service';

@Controller('api/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('start')
  start(@Body() body: { studentId: string }) {
    return this.assessmentService.start(body.studentId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.assessmentService.getAssessmentWithQuestions(id);
  }

  @Post(':id/answer')
  answer(
    @Param('id') id: string,
    @Body() body: { questionId: string; answer: string },
  ) {
    return this.assessmentService.answer(id, body.questionId, body.answer);
  }

  @Post(':id/finish')
  finish(@Param('id') id: string) {
    return this.assessmentService.finish(id);
  }

  @Get(':id/result')
  getResult(@Param('id') id: string) {
    return this.assessmentService.getResult(id);
  }
}
