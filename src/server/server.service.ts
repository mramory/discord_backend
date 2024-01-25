import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateServerDto } from './dto/createServer.dto';
import { v4 as uuidv4 } from "uuid";
import { CreateChannelDto } from './dto/createChannel.dto';
import { PusherService } from 'src/pusher/pusher.service';

@Injectable()
export class ServerService {
    constructor(
        private prismaService: PrismaService,
        private pusherService: PusherService
    ) { }

    async getServers(userId: number) {
        const servers = await this.prismaService.server.findMany({
            where: {
                conversations: {
                    some: {
                        users: {
                            some: {
                                id: userId
                            }
                        }
                    }
                }
            },
            include: {
                conversations: {
                    select: {
                        id: true
                    }
                }
            }
        })
        return servers
    }

    async getServer(id: number) {
        const server = await this.prismaService.server.findUnique({
            where: {
                id
            },
            include: {
                conversations: {
                    select: {
                        id: true,
                        name: true,
                        users: true,
                        type: true,
                        contentType: true
                    }
                }
            }
        })
        return server
    }

    async createServer(dto: CreateServerDto) {
        const newServer = await this.prismaService.server.create({
            data: {
                name: dto.name,
                img: dto.img,
                inviteCode: uuidv4(),
                conversations: {
                    create: {
                        name: "text",
                        contentType: "TEXT",
                        users: {
                            connect: {
                                id: dto.userId
                            }
                        },
                        type: "SERVER"
                    }
                }
            },
            include: {
                conversations: true
            }
        })
        return newServer
    }

    async invite(code: string, userId: number) {
        const conversations = await this.prismaService.conversation.findMany({
            where: {
                server: {
                    inviteCode: code
                }
            }
        })
        if (conversations.length < 1) throw new HttpException("Invalid Invite Code", HttpStatus.BAD_REQUEST)
        await this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                conversations: {
                    connect: conversations.map((conv) => {
                        return { id: conv.id }
                    })
                }
            }
        })
        const server = await this.prismaService.server.findFirst({
            where: {
                inviteCode: code
            },
            include: {
                conversations: {
                    select: {
                        id: true
                    }
                }
            }
        })
        return server
    }

    async getServerMembers(serverId: number) {
        const users = await this.prismaService.user.findMany({
            where: {
                conversations: {
                    some: {
                        serverId
                    }
                }
            }
        })

        return users
    }

    async createChannel(dto: CreateChannelDto) {
        const users = await this.getServerMembers(+dto.serverId)
        const newChannel = await this.prismaService.conversation.create({
            data: {
                name: dto.name,
                contentType: dto.type,
                type: "SERVER",
                server: {
                    connect: {
                        id: +dto.serverId
                    }
                },
                users: {
                    connect: users.map((user) => { return { id: user.id } })
                }
            }
        })
        users.forEach((user) => this.pusherService.trigger(`user__${user.id}__newChannel`, "newChannel", newChannel))
        return newChannel
    }

    async joinVideo(conversationId: string, mediaStream: MediaStream) {
        // console.log(mediaStream)
        this.pusherService.trigger(`videoChannel__${conversationId}`, "newJoin", mediaStream)
    }
}
