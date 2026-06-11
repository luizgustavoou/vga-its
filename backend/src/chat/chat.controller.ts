import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  createSession(@Body() body: { studentId: string; nodeId: string }) {
    return this.chatService.createSession(body.studentId, body.nodeId);
  }

  @Post('message')
  sendMessage(@Body() body: { sessionId: string; content: string }) {
    return this.chatService.sendMessage(body.sessionId, body.content);
  }

  @Get('sessions/:studentId')
  getStudentSessions(@Param('studentId') studentId: string) {
    return this.chatService.getStudentSessions(studentId);
  }

  @Get('sessions/:sessionId/messages')
  getSessionMessages(@Param('sessionId') sessionId: string) {
    return this.chatService.getSessionMessages(sessionId);
  }
}
