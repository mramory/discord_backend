import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, PrismaService, PusherService]
})
export class MessagesModule {}
