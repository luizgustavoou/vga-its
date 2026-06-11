import { Controller, Get, Param } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';

@Controller('api/knowledge-graph')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  getGraph() {
    return this.knowledgeService.getGraph();
  }

  @Get(':studentId')
  getStudentGraph(@Param('studentId') studentId: string) {
    return this.knowledgeService.getStudentGraph(studentId);
  }
}
