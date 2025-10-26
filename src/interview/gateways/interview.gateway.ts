import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/interview',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class InterviewGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const { roomId, userId } = client.handshake.query;
    console.log(`🔌 Interview WebSocket: Client connected - ${client.id}`);
    console.log(`   Room: ${roomId ?? 'n/a'}, User: ${userId ?? 'anonymous'}`);

    // Optionally join a room if provided
    if (roomId) {
      client.join(`interview:${roomId}`);
    }

    client.emit('connected', { success: true, message: 'Connected to interview' });
  }

  async handleDisconnect(client: Socket) {
    console.log(`🔌 Interview WebSocket: Client disconnected - ${client.id}`);
  }

  @SubscribeMessage('ping')
  handlePing(client: Socket, payload: any) {
    client.emit('pong', { received: payload, ts: Date.now() });
    return { success: true };
  }
}
