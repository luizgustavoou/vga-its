import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginStudentDto {
  @ApiProperty({ description: 'Email do aluno', example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do aluno', example: 'senha123' })
  @IsString()
  password: string;
}
