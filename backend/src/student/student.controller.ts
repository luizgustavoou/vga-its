import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';
import { UpdateMasteryDto } from './dto/update-mastery.dto';

@ApiTags('students')
@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar novo aluno' })
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login do aluno' })
  login(@Body() dto: LoginStudentDto) {
    return this.studentService.login(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar aluno por ID' })
  @ApiParam({ name: 'id', description: 'ID do aluno' })
  findById(@Param('id') id: string) {
    return this.studentService.findById(id);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Obter progresso completo do aluno' })
  @ApiParam({ name: 'id', description: 'ID do aluno' })
  getProgress(@Param('id') id: string) {
    return this.studentService.getProgress(id);
  }

  @Patch(':id/mastery')
  @ApiOperation({ summary: 'Atualizar domínio do aluno em um conceito' })
  @ApiParam({ name: 'id', description: 'ID do aluno' })
  updateMastery(
    @Param('id') id: string,
    @Body() dto: UpdateMasteryDto,
  ) {
    return this.studentService.updateMastery(id, dto.nodeId, dto.event);
  }
}
