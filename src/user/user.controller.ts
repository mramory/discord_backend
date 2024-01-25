import { Controller, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { Get, Put, Body } from "@nestjs/common"
import { Request } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get("/getAll")
  getAllUsers(@Req() req: Request) {
    return this.userService.getAll(req)
  }

  @UseGuards(JwtGuard)
  @Put("/change")
  changeName(@Body() dto: {newName: string, img: string}, @Req() req: Request) {
    return this.userService.change(dto, req)
  }
}
