import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';

@Module({
  controllers: [ServerController],
  providers: [ServerService, PrismaService, PusherService]
})
export class ServerModule {}
