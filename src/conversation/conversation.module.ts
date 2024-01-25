import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { PusherService } from 'src/pusher/pusher.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [ConversationController],
  providers: [ConversationService, PrismaService, AuthService, JwtService, UserService, PusherService],
})
export class ConversationModule {}
