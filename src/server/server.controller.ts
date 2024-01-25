import { Body, Controller, Get, Post, Param, Patch,Query } from '@nestjs/common';
import { ServerService } from './server.service';
import { CreateServerDto } from './dto/createServer.dto';
import { CreateChannelDto } from './dto/createChannel.dto';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @Get("/:userId")
  async getServers(@Param("userId") userId: string) {
    return this.serverService.getServers(+userId)
  }

  @Get("/full/:id")
  async getServer(@Param("id") id: string){
    return this.serverService.getServer(+id)
  }

  @Post("/channel")
  async createChannel(@Body() dto: CreateChannelDto) {
    return this.serverService.createChannel(dto)
  }

  @Post("/")
  async createServer(@Body() dto: CreateServerDto) {
    return this.serverService.createServer(dto)
  }

  @Patch("/invite/:code")
  async invite(@Param("code") code: string, @Query("userId") userId: string) {
    return this.serverService.invite(code, +userId)
  }

  @Post("/joinVideo/:conversationId") 
    async joinVideo(@Param("conversationId") conversationId: string, @Body() media: any) {
      return this.serverService.joinVideo(conversationId, media)
    }
}
