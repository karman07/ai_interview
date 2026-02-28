import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
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

  private readonly logger = new Logger(AnalyticsGateway.name);

  constructor(private readonly analyticsService: AnalyticsService) { }

  async handleConnection(client: Socket) {
    const { visitorId, sessionId, userId } = client.handshake.query;

    this.logger.log(`🔌 Analytics WebSocket: Client connected - ${client.id}`);
    this.logger.log(`   Visitor: ${visitorId}, Session: ${sessionId}, User: ${userId || 'anonymous'}`);

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
    this.logger.log(`🔌 Analytics WebSocket: Client disconnected - ${client.id}`);
  }

  @SubscribeMessage('trackPageView')
  async handleTrackPageView(client: Socket, data: any) {
    try {
      const pageView = await this.analyticsService.trackPageView(data);

      // Emit to all clients in the same session
      this.server.to(`session:${data.sessionId}`).emit('pageViewTracked', pageView);

      return { success: true, pageView };
    } catch (error) {
      this.logger.error(`❌ Analytics WebSocket: trackPageView error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('trackEvent')
  async handleTrackEvent(client: Socket, data: any) {
    try {
      this.logger.log(`📊 Analytics WebSocket: Event tracked: ${JSON.stringify(data)}`);

      // You can extend this to track custom events
      return { success: true, event: data };
    } catch (error) {
      this.logger.error(`❌ Analytics WebSocket: trackEvent error: ${error.message}`);
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
