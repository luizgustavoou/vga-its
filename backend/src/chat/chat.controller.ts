import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('chat')
@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Criar ou retomar sessão de chat' })
  createSession(@Body() dto: CreateSessionDto) {
    return this.chatService.createSession(dto.studentId, dto.nodeId);
  }

  @Post('message')
  @ApiOperation({ summary: 'Enviar mensagem para o tutor' })
  sendMessage(@Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(dto.sessionId, dto.content);
  }

  @Get('sessions/:studentId')
  @ApiOperation({ summary: 'Listar sessões do aluno' })
  @ApiParam({ name: 'studentId', description: 'ID do aluno' })
  getStudentSessions(@Param('studentId') studentId: string) {
    return this.chatService.getStudentSessions(studentId);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Buscar mensagens de uma sessão' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão' })
  getSessionMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getSessionMessages(sessionId);
  }
}
