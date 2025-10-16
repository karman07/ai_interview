import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AnalyticsService } from '../analytics.service';

@WebSocketGateway({
  namespace: '/analytics',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class AnalyticsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly analyticsService: AnalyticsService) {}

  async handleConnection(client: Socket) {
    const { visitorId, sessionId, userId } = client.handshake.query;
    
    console.log(`🔌 Analytics WebSocket: Client connected - ${client.id}`);
    console.log(`   Visitor: ${visitorId}, Session: ${sessionId}, User: ${userId || 'anonymous'}`);

    // Join room for this visitor
    if (visitorId) {
      client.join(`visitor:${visitorId}`);
    }

    // Join room for this session
    if (sessionId) {
      client.join(`session:${sessionId}`);
    }

    // Emit connection success
    client.emit('connected', {
      success: true,
      message: 'Connected to analytics',
      data: { visitorId, sessionId, userId },
    });
  }

  async handleDisconnect(client: Socket) {
    console.log(`🔌 Analytics WebSocket: Client disconnected - ${client.id}`);
  }

  @SubscribeMessage('trackPageView')
  async handleTrackPageView(client: Socket, data: any) {
    try {
      const pageView = await this.analyticsService.trackPageView(data);
      
      // Emit to all clients in the same session
      this.server.to(`session:${data.sessionId}`).emit('pageViewTracked', pageView);
      
      return { success: true, pageView };
    } catch (error) {
      console.error('❌ Analytics WebSocket: trackPageView error:', error.message);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('trackEvent')
  async handleTrackEvent(client: Socket, data: any) {
    try {
      console.log('📊 Analytics WebSocket: Event tracked:', data);
      
      // You can extend this to track custom events
      return { success: true, event: data };
    } catch (error) {
      console.error('❌ Analytics WebSocket: trackEvent error:', error.message);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(client: Socket, data: any) {
    // Keep session alive
    return { success: true, timestamp: new Date() };
  }

  // Broadcast analytics updates to admin clients
  broadcastAnalyticsUpdate(event: string, data: any) {
    this.server.emit(event, data);
  }
}
