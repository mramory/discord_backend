import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService, PusherService],
})
export class FriendsModule {}
