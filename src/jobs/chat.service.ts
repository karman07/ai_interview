import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument, Message, MessageType } from './schemas/chat.schema';
import { EmployerRequest, EmployerRequestDocument } from './schemas/employer-request.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(EmployerRequest.name) private requestModel: Model<EmployerRequestDocument>,
  ) {}

  async createOrGetChat(
    employerId: string,
    employeeId: string,
    jobId?: string,
    requestId?: string
  ): Promise<ChatDocument> {
    // Check if chat already exists
    const existingChat = await this.chatModel.findOne({
      employerId: new Types.ObjectId(employerId),
      employeeId: new Types.ObjectId(employeeId),
      ...(jobId && { jobId: new Types.ObjectId(jobId) }),
      ...(requestId && { requestId: new Types.ObjectId(requestId) })
    });

    if (existingChat) {
      return existingChat;
    }

    // Create new chat
    const chat = new this.chatModel({
      employerId: new Types.ObjectId(employerId),
      employeeId: new Types.ObjectId(employeeId),
      ...(jobId && { jobId: new Types.ObjectId(jobId) }),
      ...(requestId && { requestId: new Types.ObjectId(requestId) }),
      messages: [],
      lastMessageAt: new Date(),
      isActive: true
    });

    return chat.save();
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string,
    type: MessageType = MessageType.TEXT,
    fileUrl?: string
  ): Promise<ChatDocument> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    // Verify sender is part of the chat
    const senderObjectId = new Types.ObjectId(senderId);
    if (!chat.employerId.equals(senderObjectId) && !chat.employeeId.equals(senderObjectId)) {
      throw new BadRequestException('Unauthorized to send message in this chat');
    }

    const message: Message = {
      senderId: senderObjectId,
      content,
      type,
      fileUrl,
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(message);
    chat.lastMessageAt = new Date();

    return chat.save();
  }

  async getUserChats(userId: string): Promise<ChatDocument[]> {
    const userObjectId = new Types.ObjectId(userId);
    
    return this.chatModel
      .find({
        $or: [
          { employerId: userObjectId },
          { employeeId: userObjectId }
        ],
        isActive: true
      })
      .populate('employerId', 'name email')
      .populate('employeeId', 'name email')
      .populate('jobId', 'title')
      .sort({ lastMessageAt: -1 })
      .exec();
  }

  async getChatById(chatId: string, userId: string): Promise<ChatDocument> {
    const userObjectId = new Types.ObjectId(userId);
    
    const chat = await this.chatModel
      .findOne({
        _id: new Types.ObjectId(chatId),
        $or: [
          { employerId: userObjectId },
          { employeeId: userObjectId }
        ]
      })
      .populate('employerId', 'name email')
      .populate('employeeId', 'name email')
      .populate('jobId', 'title')
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found or unauthorized');
    }

    return chat;
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    
    await this.chatModel.updateOne(
      { 
        _id: new Types.ObjectId(chatId),
        $or: [
          { employerId: userObjectId },
          { employeeId: userObjectId }
        ]
      },
      {
        $set: {
          'messages.$[elem].isRead': true
        }
      },
      {
        arrayFilters: [
          { 'elem.senderId': { $ne: userObjectId }, 'elem.isRead': false }
        ]
      }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    const userObjectId = new Types.ObjectId(userId);
    
    const chats = await this.chatModel.find({
      $or: [
        { employerId: userObjectId },
        { employeeId: userObjectId }
      ],
      isActive: true
    });

    let unreadCount = 0;
    for (const chat of chats) {
      const unreadMessages = chat.messages.filter(
        msg => !msg.senderId.equals(userObjectId) && !msg.isRead
      );
      unreadCount += unreadMessages.length;
    }

    return unreadCount;
  }
}