import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class FriendsService {
    constructor(
        private prismaService: PrismaService,
        private pusherService: PusherService
    ) {}

    async getAllFriends(currentUserId: number) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: currentUserId
            },
            select: {
                friends: true
            }
        })
        return user.friends
    }

    async sendRequest(id: number, myId: number) {
        const existingFriendRequest = await this.prismaService.friendRequest.findFirst({
            where: {
                OR: [
                    {
                        senderUserId: myId,
                        recipientUserId: id
                    },
                    {
                        senderUserId: id,
                        recipientUserId: myId
                    }
                ]
                
            }
        })
        if(existingFriendRequest) throw new HttpException("Friend Request Already Send", HttpStatus.CONFLICT)
        const alreadyFriends = await this.prismaService.user.findFirst({
            where: {
                id: myId,
                friends: {
                    some: {
                        id
                    }
                }
            }
        })
        if(alreadyFriends) throw new HttpException("Already Friends", HttpStatus.FORBIDDEN)
        const newFriendRequest = await this.prismaService.friendRequest.create({
            data: {
                senderUser: {
                    connect: {
                        id: myId
                    }
                },
                recipientUser: {
                    connect: {
                        id
                    }
                }
            },
            include: {
                senderUser: {
                    select: {
                        id: true,
                        name: true,
                        viewName: true,
                        email: true
                    }
                }
            }
        })
        if(!newFriendRequest) throw new HttpException("Can not Create Friend Request", HttpStatus.CONFLICT)

        this.pusherService.trigger(`friend__${id}`, "newFriendRequest", newFriendRequest)
        return newFriendRequest
    }


    async getFriendRequests(currentUserId: number) {
        const friendRequests = await this.prismaService.$queryRaw(
            Prisma.sql`
            SELECT 
                "FriendRequest".id AS "requestId",
                "FriendRequest"."senderUserId",
                "FriendRequest"."recipientUserId",
                "User".id AS "senderId",
                "User".email AS "senderEmail",
                "User".name AS "senderName",
                "User"."view_name" AS "senderViewName"
            FROM 
                "FriendRequest"
            JOIN 
                "User" ON "FriendRequest"."senderUserId" = "User".id
            WHERE 
                "FriendRequest"."recipientUserId" = ${currentUserId};
        `
        )
        if(!friendRequests) throw new HttpException("Friends Not Found", HttpStatus.NOT_FOUND)
        return friendRequests
    }

    async acceptFriendRequest(requestId: number) {
        const deletedRequest = await this.prismaService.friendRequest.delete({
            where: {
                id: requestId
            }
        })
        const updatedUser = await this.prismaService.user.update({
            where: {
                id: deletedRequest.recipientUserId
            },
            data: {
                friends: {
                    connect: {
                        id: deletedRequest.senderUserId
                    }
                },
                friendsOf: {
                    connect: {
                        id: deletedRequest.senderUserId
                    }
                }
            },
            include: {
                friends: {
                    where: {
                        id: deletedRequest.senderUserId
                    }
                }
            }
        })
        return updatedUser.friends[0]
    }

    async denyFriendRequest(requestId: number) {
        const deletedRequest = await this.prismaService.friendRequest.delete({
            where: {
                id: requestId
            }
        })
        return deletedRequest
    }
}
