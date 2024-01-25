import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConversationModule } from './conversation/conversation.module';
import { PusherModule } from './pusher/pusher.module';
import { MessagesModule } from './messages/messages.module';
import { FriendsModule } from './friends/friends.module';
import { ServerModule } from './server/server.module';
import { SocketModule } from './socket/socket.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [UserModule, AuthModule, ConfigModule.forRoot({isGlobal: true}), ConversationModule, PusherModule, MessagesModule, FriendsModule, ServerModule, SocketModule, CloudinaryModule]
})
export class AppModule {}
