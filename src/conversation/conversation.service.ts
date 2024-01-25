import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';
import { CreateGroupConversationDto } from './dto/createGroupConversation.dto';
import { JwtPayload } from 'src/auth/interfaces';

@Injectable()
export class ConversationService {
    constructor(
        private prismaService: PrismaService,
        private authService: AuthService,
        private pusherService: PusherService
    ) {}

    async getAllConversations(req: Request) {
        const currentUser = this.authService.checkIsAuth(req) as JwtPayload
        const conversations = await this.prismaService.conversation.findMany({
            where: {
                users: {
                    some: {
                        id: currentUser.id
                    }
                },
                type: "DIALOG"
            },
            include: {
                users: true
            }
        })
        return conversations
    }

    async getConversation(conversationId: number = -1, userId: number = -1, currentUserId: number = -1) {
        const existConversation = await this.prismaService.conversation.findMany({
            where: {
                type: "DIALOG",
                OR: [
                    {id: +conversationId},
                    {users: {
                        every: {
                            OR: [
                                {id: +userId},
                                {id: +currentUserId}
                            ]
                        }
                    }}
                ]
            },
            include: {
                users: true
            }
        })
        if(existConversation.length > 0){
            return existConversation[0]
        }
        return null 
    }

    async createConversation(req: Request, userId: number) {
        const currentUser = this.authService.checkIsAuth(req) as JwtPayload
        const existConversation = await this.getConversation(null, userId, currentUser.id)
        if(existConversation) {
            return existConversation
        }
        const newConversation = await this.prismaService.conversation.create({
            data: {
                users: {
                    connect: [
                        {id: +userId},
                        {id: +currentUser.id}
                    ]
                },
                type: "DIALOG",
            },
            include: {
                users: true
            }
        })
        this.pusherService.trigger(`user__${userId}__newConversation`, "newConversation", newConversation)
        return newConversation
    }

    async deleteConversation(id: number) {
        const deleted = await this.prismaService.conversation.delete({
            where: {
                id: +id
            },
            include: {
                users: true
            }
        })
        const users = deleted.users
        users.forEach(user => {
            this.pusherService.trigger(`user__${user.id}__deleteConversation`, "deleteConversation", deleted)
        })
        return deleted
    }
}
