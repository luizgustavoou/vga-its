import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';

@ApiTags('knowledge-graph')
@Controller('knowledge-graph')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({ summary: 'Obter grafo de conhecimento completo' })
  getGraph() {
    return this.knowledgeService.getGraph();
  }

  @Get(':studentId')
  @ApiOperation({ summary: 'Obter grafo personalizado do aluno' })
  @ApiParam({ name: 'studentId', description: 'ID do aluno' })
  getStudentGraph(@Param('studentId') studentId: string) {
    return this.knowledgeService.getStudentGraph(studentId);
  }
}
