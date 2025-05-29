import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';
import { userSelectFieldsNoRef } from '../auth/dto/user.dto';

@Injectable()
export class FriendsService {
  constructor(
    private prismaService: PrismaService,
    private pusherService: PusherService,
  ) {}

  async getAllFriends(currentUserId: number) {
    const friendships = await this.prismaService.friendship.findMany({
      where: {
        OR: [{ initiatorId: currentUserId }, { receiverId: currentUserId }],
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        initiatorId: true,
        receiverId: true,
        initiator: {
          select: userSelectFieldsNoRef,
        },
        receiver: {
          select: userSelectFieldsNoRef,
        },
        createdAt: true,
      },
    });

    return friendships.map((friendship) => {
      const friend =
        friendship.initiatorId === currentUserId
          ? friendship.receiver
          : friendship.initiator;

      return {
        ...friend,
        friendshipCreatedAt: friendship.createdAt,
      };
    });
  }

  async sendRequest(id: number, myId: number) {
    const existingFriendRequest =
      await this.prismaService.friendRequest.findFirst({
        where: {
          OR: [
            {
              senderUserId: myId,
              recipientUserId: id,
            },
            {
              senderUserId: id,
              recipientUserId: myId,
            },
          ],
        },
      });
    if (existingFriendRequest)
      throw new HttpException(
        'Friend Request Already Send',
        HttpStatus.CONFLICT,
      );

    const existingFriendship = await this.prismaService.friendship.findFirst({
      where: {
        OR: [
          {
            initiatorId: myId,
            receiverId: id,
          },
          {
            initiatorId: id,
            receiverId: myId,
          },
        ],
      },
    });
    if (existingFriendship)
      throw new HttpException('Already Friends', HttpStatus.FORBIDDEN);

    const newFriendRequest = await this.prismaService.friendRequest.create({
      data: {
        senderUser: {
          connect: {
            id: myId,
          },
        },
        recipientUser: {
          connect: {
            id,
          },
        },
      },
      include: {
        senderUser: {
          select: userSelectFieldsNoRef,
        },
      },
    });
    if (!newFriendRequest)
      throw new HttpException(
        'Can not Create Friend Request',
        HttpStatus.CONFLICT,
      );

    this.pusherService.trigger(
      `friend__${id}`,
      'newFriendRequest',
      newFriendRequest,
    );
    return newFriendRequest;
  }

  async getFriendRequests(currentUserId: number) {
    const friendRequests = await this.prismaService.friendRequest.findMany({
      where: {
        recipientUserId: currentUserId,
      },
      select: {
        id: true,
        senderUserId: true,
        recipientUserId: true,
        senderUser: {
          select: {
            id: true,
            email: true,
            name: true,
            viewName: true,
          },
        },
      },
    });

    return friendRequests;
  }

  async acceptFriendRequest(requestId: number) {
    const deletedRequest = await this.prismaService.friendRequest.delete({
      where: {
        id: requestId,
      },
    });

    const friendship = await this.prismaService.friendship.create({
      data: {
        initiator: {
          connect: {
            id: deletedRequest.senderUserId,
          },
        },
        receiver: {
          connect: {
            id: deletedRequest.recipientUserId,
          },
        },
      },
      include: {
        initiator: {
          select: userSelectFieldsNoRef,
        },
      },
    });

    return friendship.initiator;
  }

  async denyFriendRequest(requestId: number) {
    const deletedRequest = await this.prismaService.friendRequest.delete({
      where: {
        id: requestId,
      },
    });
    return deletedRequest;
  }
}
