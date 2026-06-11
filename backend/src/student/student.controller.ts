import { Controller, Post, Get, Patch, Body, Param } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { LoginStudentDto } from './dto/login-student.dto';

@Controller('api/students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.studentService.create(dto);
  }

  @Post('login')
  login(@Body() dto: LoginStudentDto) {
    return this.studentService.login(dto);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentService.findById(id);
  }

  @Get(':id/progress')
  getProgress(@Param('id') id: string) {
    return this.studentService.getProgress(id);
  }

  @Patch(':id/mastery')
  updateMastery(
    @Param('id') id: string,
    @Body() body: { nodeId: string; event: 'correct' | 'incorrect' | 'correct_with_hint' },
  ) {
    return this.studentService.updateMastery(id, body.nodeId, body.event);
  }
}
