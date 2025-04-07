import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PusherService } from 'src/pusher/pusher.service';
import { CreateMessageDto } from './dto/createMessage.dto';
import { Prisma } from '@prisma/client';

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
        
        const newMessage = await this.prismaService.$queryRaw(Prisma.sql
            `WITH inserted_message AS (
                INSERT INTO "Message" (text, image, "senderId", "conversationId", "createdAt")
                VALUES (${data.text}, ${data.image}, ${data.senderId}, ${Number(data.conversationId)}, NOW())
                RETURNING *
            )
            SELECT 
                m.*,
                jsonb_build_object(
                    'name', u.name,
                    'img', u.img
                ) AS sender
            FROM inserted_message m
            JOIN "User" u ON m."senderId" = u.id;`,
        );
        this.pusherService.trigger(`conversation__${data.conversationId}`, "newMessage", newMessage[0])
        return newMessage
    }

    async delete(id: string) {
        return await this.prismaService.message.delete({where: {id: Number(id)}})
    } 
}
