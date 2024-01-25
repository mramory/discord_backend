import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';

@Module({
  controllers: [FriendsController],
  providers: [FriendsService, PrismaService, PusherService]
})
export class FriendsModule {}
