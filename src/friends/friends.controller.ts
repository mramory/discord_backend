import { Controller, Param, Post, Body, Get,Query, Delete, UseGuards, Req } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AcceptOrDenyFriendRequestDto, GetFriendRequestsDto } from './dto/getFriends.dto';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { Request } from 'express';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(JwtGuard)
  @Get("/")
  async getAllFriends(@Req() req: Request, @Query() {currentUserId}: GetFriendRequestsDto) {
    return this.friendsService.getAllFriends(+currentUserId)
  }

  @Post("/:id")
  async sendRequest(@Param("id") id: string, @Body() {myId}: {myId: string | number}) {
    return this.friendsService.sendRequest(+id, +myId)
  }

  @UseGuards(JwtGuard)
  @Get("/req")
  async getFriendRequests(@Req() req: Request, @Query() {currentUserId}: GetFriendRequestsDto) {
    return this.friendsService.getFriendRequests(+currentUserId)
  }

  @Post("/")
  async acceptFriendRequest(@Query() {requestId}: AcceptOrDenyFriendRequestDto) {
    return this.friendsService.acceptFriendRequest(+requestId)
  }

  @Delete("/")
  async denyFriendRequest(@Query() {requestId}: AcceptOrDenyFriendRequestDto) {
    return this.friendsService.denyFriendRequest(+requestId)
  }

}
