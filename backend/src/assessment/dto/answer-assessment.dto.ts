import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerAssessmentDto {
  @ApiProperty({ description: 'ID da questão', example: '6651a1b2c3d4e5f6a7b8c9d0' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'Resposta do aluno', example: '2x3' })
  @IsString()
  @IsNotEmpty()
  answer: string;
}
