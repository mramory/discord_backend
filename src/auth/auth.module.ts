import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as dotenv from 'dotenv';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { options } from './config/jwt.config';
import { JwtStrategy } from './strategies/jwt.strategy';
dotenv.config();

@Module({
  controllers: [AuthController],
  providers: [AuthService, PrismaService, UserService, JwtStrategy],
  imports: [
    PassportModule,
    JwtModule.registerAsync(options()),
    CloudinaryModule,
  ],
})
export class AuthModule {}
