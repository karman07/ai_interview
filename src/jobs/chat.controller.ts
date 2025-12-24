import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards,
  Patch
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChatService } from './chat.service';
import { MessageType } from './schemas/chat.schema';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('create')
  async createChat(
    @CurrentUser() user: any,
    @Body() createData: {
      employerId: string;
      employeeId: string;
      jobId?: string;
      requestId?: string;
    }
  ) {
    return this.chatService.createOrGetChat(
      createData.employerId,
      createData.employeeId,
      createData.jobId,
      createData.requestId
    );
  }

  @Get('my-chats')
  async getUserChats(@CurrentUser() user: any) {
    return this.chatService.getUserChats(user.sub);
  }

  @Get(':chatId')
  async getChatById(
    @Param('chatId') chatId: string,
    @CurrentUser() user: any
  ) {
    return this.chatService.getChatById(chatId, user.sub);
  }

  @Post(':chatId/message')
  async sendMessage(
    @Param('chatId') chatId: string,
    @CurrentUser() user: any,
    @Body() messageData: {
      content: string;
      type?: MessageType;
      fileUrl?: string;
    }
  ) {
    return this.chatService.sendMessage(
      chatId,
      user.sub,
      messageData.content,
      messageData.type,
      messageData.fileUrl
    );
  }

  @Patch(':chatId/read')
  async markAsRead(
    @Param('chatId') chatId: string,
    @CurrentUser() user: any
  ) {
    await this.chatService.markMessagesAsRead(chatId, user.sub);
    return { success: true };
  }

  @Get('unread/count')
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.chatService.getUnreadCount(user.sub);
    return { unreadCount: count };
  }
}