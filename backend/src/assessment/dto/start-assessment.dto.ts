import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartAssessmentDto {
  @ApiProperty({ description: 'ID do aluno', example: '6651a1b2c3d4e5f6a7b8c9d0' })
  @IsString()
  @IsNotEmpty()
  studentId: string;
}
