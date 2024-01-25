import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { ACTIONS } from './constants';

@Injectable()
export class SocketService {
    private readonly connectedClients: Map<string, Socket> = new Map();
    private onlineUsers: Array<string> = new Array()

    constructor(
        private readonly ACTIONS: ACTIONS
    ) { }

    async handleConnection(client: Socket) {
        
    }

    async handleDisconnect(client: Socket) {
        
    }

    async joinRoom(data: { room: string, img: string }, client: Socket) {
        const { room: roomID, img } = data;
        const { rooms: joinedRooms } = client;
        client.data.img = img

        if (Array.from(joinedRooms).includes(roomID)) {
            return console.warn(`Already joined to ${roomID}`);
        }
        const joinedSockets = await client.in(roomID).fetchSockets()
        const clients = joinedSockets || [];

        clients.forEach(joinedClient => {
            client.to(joinedClient.id).emit(ACTIONS.ADD_PEER, {
                peerID: client.id,
                img: img,
                createOffer: false
            });

            client.emit(ACTIONS.ADD_PEER, {
                peerID: joinedClient.id,
                img: joinedClient.data.img,
                createOffer: true,
            });
        });
        client.join(roomID);
    }


    async LeaveRoom(client: Socket) {
        const { rooms } = client;

        Array.from(rooms)
            .filter(room => !isNaN(+room))
            .forEach(async (roomID) => {
                const joinedSockets = await client.in(roomID).fetchSockets()

                const clients = Array.from(joinedSockets || []);

                clients
                    .forEach(joinedClient => {
                        client.to(joinedClient.id).emit(ACTIONS.REMOVE_PEER, {
                            peerID: client.id,
                        });

                        client.emit(ACTIONS.REMOVE_PEER, {
                            peerID: joinedClient.id,
                        });
                    });

                client.leave(roomID);
            })
    }
}
