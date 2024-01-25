import { Controller, Get, Param, Post, Query, Body } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/createMessage.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get("/")
  async getAllMessages(@Query("convId") convId: string) {
    return this.messagesService.getAll(+convId)
  }

  @Get("/:id")
  async getMessage(@Param("id") id: string) {
    return this.messagesService.getMessage(+id)
  }

  @Post("/")
  async createMessage(@Body() body: CreateMessageDto) {
    return this.messagesService.create(body)
  }


}
