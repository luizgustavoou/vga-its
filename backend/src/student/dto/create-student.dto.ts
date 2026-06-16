import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ description: 'Nome do aluno', example: 'João Silva', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Email do aluno', example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Senha do aluno', example: 'senha123', minLength: 4 })
  @IsString()
  @MinLength(4)
  password: string;
}
