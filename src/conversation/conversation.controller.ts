import { Controller, Post, Get, UseGuards, Param, Req, Delete, Body } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';
import { CreateGroupConversationDto } from './dto/createGroupConversation.dto';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtGuard)
  @Get("/")
  async getAllConversation(@Req() req: Request) {
    return this.conversationService.getAllConversations(req)
  }

  @UseGuards(JwtGuard)
  @Get("/:id")
  async getConversation(@Param("id") conversationId: number) {
    return this.conversationService.getConversation(conversationId)
  }

  @UseGuards(JwtGuard)
  @Post("/:userId")
  async createConversation(@Req() req: Request, @Param("userId") userId: number) {
    return this.conversationService.createConversation(req, userId)
  }

  @UseGuards(JwtGuard)
  @Delete("/:id")
  async deleteConversation(@Param("id") id: number) {
    return this.conversationService.deleteConversation(id)
  }


}
