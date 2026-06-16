import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ description: 'ID da sessão de chat', example: '6651a1b2c3d4e5f6a7b8c9d0' })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ description: 'Conteúdo da mensagem', example: 'O que é uma matriz?' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
