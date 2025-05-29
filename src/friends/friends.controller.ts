import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { IJwtRequest } from 'src/types/common';
import { AcceptOrDenyFriendRequestDto } from './dto/getFriends.dto';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @UseGuards(JwtGuard)
  @Get('/')
  async getAllFriends(@Req() req: IJwtRequest) {
    return this.friendsService.getAllFriends(req.user.id);
  }

  @Post('/:id')
  async sendRequest(
    @Param('id') id: string,
    @Body() { myId }: { myId: string | number },
  ) {
    return this.friendsService.sendRequest(+id, +myId);
  }

  @UseGuards(JwtGuard)
  @Get('/req')
  async getFriendRequests(@Req() req: IJwtRequest) {
    return this.friendsService.getFriendRequests(req.user.id);
  }

  @Post('/')
  async acceptFriendRequest(
    @Query() { requestId }: AcceptOrDenyFriendRequestDto,
  ) {
    return this.friendsService.acceptFriendRequest(+requestId);
  }

  @Delete('/')
  async denyFriendRequest(
    @Query() { requestId }: AcceptOrDenyFriendRequestDto,
  ) {
    return this.friendsService.denyFriendRequest(+requestId);
  }
}
