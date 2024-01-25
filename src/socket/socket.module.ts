import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { ACTIONS } from './constants';

@Module({
  providers: [SocketGateway, SocketService, ACTIONS],
})
export class SocketModule {}
