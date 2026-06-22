import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { AnswerAssessmentDto } from './dto/answer-assessment.dto';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar ou retomar avaliação diagnóstica' })
  start(@Body() dto: StartAssessmentDto) {
    return this.assessmentService.start(dto.studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação com questão atual' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  findById(@Param('id') id: string) {
    return this.assessmentService.getAssessmentWithQuestions(id);
  }

  @Post(':id/answer')
  @ApiOperation({ summary: 'Responder uma questão da avaliação' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  answer(
    @Param('id') id: string,
    @Body() dto: AnswerAssessmentDto,
  ) {
    return this.assessmentService.answer(id, dto.questionId, dto.answer);
  }

  @Post(':id/finish')
  @ApiOperation({ summary: 'Finalizar avaliação e calcular resultados' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  finish(@Param('id') id: string) {
    return this.assessmentService.finish(id);
  }

  @Get(':id/result')
  @ApiOperation({ summary: 'Obter resultado detalhado da avaliação' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  getResult(@Param('id') id: string) {
    return this.assessmentService.getResult(id);
  }
}
