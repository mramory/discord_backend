import { WebSocketGateway, OnGatewayConnection, WebSocketServer, OnGatewayDisconnect } from '@nestjs/websockets';
import { ConnectedSocket, MessageBody, SubscribeMessage } from "@nestjs/websockets/decorators"
import { Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { ACTIONS } from './constants';


@WebSocketGateway({
  cors: {
    origin: "http://localhost:3000"
  }
})
export class SocketGateway implements OnGatewayDisconnect, OnGatewayConnection {
  private readonly connectedClients: Map<string, Socket> = new Map()
  @WebSocketServer()
  private server: Socket;

  constructor(
    private readonly socketService: SocketService,
    private readonly ACTIONS: ACTIONS
  ) { }

  handleConnection(client: Socket) {

  }

  handleDisconnect(socket: Socket) {
    this.socketService.LeaveRoom(socket)
  }

  @SubscribeMessage("new_online_user")
  NewOnlineUserHandler(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    const id = userId.toString()
    if (!this.connectedClients.has(id)) {
      this.connectedClients.set(id, client)
    }
    this.server.emit("get_online_users", Array.from(this.connectedClients.keys()))
  }

  @SubscribeMessage("new_offline_user")
  NewOfflineUserHandler(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    const id = userId.toString()
    if(this.connectedClients.has(id)){
      this.connectedClients.delete(id)
    }
    this.server.emit("get_online_users", Array.from(this.connectedClients.keys()))
  }

  @SubscribeMessage(ACTIONS.JOIN)
  JoinHandle(@MessageBody() data: { room: string, img: string }, @ConnectedSocket() client: Socket) {
    this.socketService.joinRoom(data, client)
  }

  @SubscribeMessage(ACTIONS.RELAY_SDP)
  RelaySDP(@MessageBody() data: { peerID: string, img: string, sessionDescription: RTCSessionDescriptionInit }, @ConnectedSocket() client: Socket) {
    client.to(data.peerID).emit(ACTIONS.SESSION_DESCRIPTION, {
      peerID: client.id,
      img: data.img,
      sessionDescription: data.sessionDescription,
    });
  }

  @SubscribeMessage(ACTIONS.RELAY_ICE)
  RelayIce(@MessageBody() data: { peerID: string, iceCandidate: RTCIceCandidateInit }, @ConnectedSocket() client: Socket) {
    client.to(data.peerID).emit(ACTIONS.ICE_CANDIDATE, {
      peerID: client.id,
      iceCandidate: data.iceCandidate,
    });
  }

  @SubscribeMessage(ACTIONS.LEAVE)
  Leave(@ConnectedSocket() client: Socket) {
    this.socketService.LeaveRoom(client)
  }
}