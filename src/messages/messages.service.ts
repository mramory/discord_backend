import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';
import { CreateMessageDto } from './dto/createMessage.dto';

@Injectable()
export class MessagesService {
    constructor(
        private prismaService: PrismaService,
        private pusherService: PusherService
    ) {}

    async getAll(convId: number) {
        return this.prismaService.message.findMany({
            where: {
                conversationId: convId
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        img: true
                    }
                }
            }
        })
    }
    async getMessage(id: number) {
        return `All One Message ${id}`
    }
    async create(data: CreateMessageDto) {
        
        const newMessage = await this.prismaService.message.create({
            data: {
                text: data.text,
                image: data.image,
                sender: {
                    connect: {
                        id: data.senderId
                    }
                },
                conversation: {
                    connect: {
                        id: +data.conversationId
                    }
                }
            },
            include: {
                sender: {
                    select: {
                        name: true,
                        img: true
                    }
                }
            }
            
        })
        this.pusherService.trigger(`conversation__${data.conversationId}`, "newMessage", newMessage)
        return newMessage
    }
}
