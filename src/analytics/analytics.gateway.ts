import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { TrackPageViewDto, TrackVisitorDto, StartSessionDto, EndSessionDto } from './dto';

interface ClientData {
  visitorId: string;
  sessionId: string;
  userId?: string;
  connectedAt: Date;
  lastActivity: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
  },
  namespace: '/analytics',
})
@Injectable()
export class AnalyticsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AnalyticsGateway.name);
  private readonly connectedClients = new Map<string, ClientData>();
  private readonly adminClients = new Set<string>();
  private realTimeStatsInterval: NodeJS.Timeout;
  // Recent ended sessions map to prevent duplicate processing (sessionId -> timestamp ms)
  private readonly recentEndedSessions = new Map<string, number>();

  constructor(private readonly analyticsService: AnalyticsService) {}
  private getClientIp(client: Socket): string {
    // Try multiple locations for remote IP to be resilient across transports
    const anyClient: any = client as any;
    return (
      anyClient.conn?.remoteAddress ||
      client.handshake?.address ||
      anyClient.request?.socket?.remoteAddress ||
      'unknown'
    );
  }

  private formatClientLog(client: Socket, clientData?: Partial<ClientData>) {
    const ip = this.getClientIp(client);
    const qs = client.handshake?.query || {};
  const isAdmin = String(qs.isAdmin) === 'true';
    const visitorId = clientData?.visitorId || (qs.visitorId as string) || 'unknown';
    const sessionId = clientData?.sessionId || (qs.sessionId as string) || 'unknown';
    const userId = clientData?.userId || (qs.userId as string) || 'unknown';
    return `socket=${client.id} ip=${ip} visitor=${visitorId} session=${sessionId} user=${userId} admin=${isAdmin} time=${new Date().toISOString()}`;
  }

  afterInit(server: Server) {
    this.logger.log('Analytics WebSocket Gateway initialized');
    
    // Send real-time stats to admin clients every 10 seconds
    this.realTimeStatsInterval = setInterval(async () => {
      await this.broadcastRealTimeStats();
    }, 10000);
  }

  async handleConnection(client: Socket) {
    try {
      const { visitorId, sessionId, userId, userAgent, country, device, isAdmin } = client.handshake.query;
      // Detailed connect log
      this.logger.log(`[CONNECT] ${this.formatClientLog(client)}`);
      
      if (isAdmin === 'true') {
        this.adminClients.add(client.id);
  this.logger.log(`[ADMIN CONNECT] ${this.formatClientLog(client)}`);
        
        // Send initial real-time stats to admin
        const realTimeStats = await this.analyticsService.getRealTimeStats();
        client.emit('realTimeStats', realTimeStats);
      } else {
        // Track regular visitor connection
        if (visitorId && sessionId) {
          const clientData: ClientData = {
            visitorId: visitorId as string,
            sessionId: sessionId as string,
            userId: userId as string,
            connectedAt: new Date(),
            lastActivity: new Date(),
          };
          
          this.connectedClients.set(client.id, clientData);
          
          // Track visitor if not already tracked
          const trackVisitorDto: TrackVisitorDto = {
            visitorId: visitorId as string,
            sessionId: sessionId as string,
            userId: userId as string,
            userAgent: userAgent as string,
            country: country as string,
            device: device as string,
          };
          
          await this.analyticsService.trackVisitor(trackVisitorDto);
          this.logger.debug(`Tracked visitor on connect: ${this.formatClientLog(client, clientData)}`);
        }
      }
      
      // Broadcast updated active users count to all admin clients
      await this.broadcastActiveUsersCount();
      this.logger.debug(`Connected clients count: ${this.connectedClients.size}`);
    } catch (error) {
      this.logger.error(`Error handling connection: ${error.message}`, error.stack);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      // Detailed disconnect log
      const clientData = this.connectedClients.get(client.id);
      this.logger.log(`[DISCONNECT] ${this.formatClientLog(client, clientData)}`);
      
      if (this.adminClients.has(client.id)) {
        this.adminClients.delete(client.id);
  this.logger.log(`[ADMIN DISCONNECT] ${this.formatClientLog(client)}`);
      } else {
        const clientData = this.connectedClients.get(client.id);
        if (clientData) {
          // Calculate session duration if we have start time
          const duration = Math.floor((new Date().getTime() - clientData.connectedAt.getTime()) / 1000);
      this.logger.log(`Session disconnect duration: socket=${client.id} session=${clientData.sessionId} visitor=${clientData.visitorId} duration=${duration}s`);
      this.connectedClients.delete(client.id);
        }
      }
      
      // Broadcast updated active users count to all admin clients
      await this.broadcastActiveUsersCount();
      
      this.logger.debug(`Connected clients count: ${this.connectedClients.size}`);
    } catch (error) {
      this.logger.error(`Error handling disconnect: ${error.message}`, error.stack);
    }
  }

  @SubscribeMessage('startSession')
  async handleStartSession(
    @MessageBody() data: StartSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const session = await this.analyticsService.startSession(data);
      
      // Update client data
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        clientData.sessionId = data.sessionId;
        clientData.lastActivity = new Date();
      }
      
      client.emit('sessionStarted', { sessionId: session.sessionId });
      
      // Broadcast to admin clients
      this.broadcastToAdmins('newSession', {
        sessionId: session.sessionId,
        visitorId: session.visitorId,
        timestamp: session.startTime,
      });
      
      this.logger.log(`Session started via WebSocket: ${session.sessionId}`);
    } catch (error) {
      this.logger.error(`Error starting session: ${error.message}`, error.stack);
      client.emit('exception', { 
        message: 'Failed to start session', 
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('endSession')
  async handleEndSession(
    @MessageBody() data: EndSessionDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // debounce repeated end requests for same session (3s window)
      const last = this.recentEndedSessions.get(data.sessionId);
      const now = Date.now();
      if (last && now - last < 3000) {
        this.logger.debug(`Duplicate endSession call ignored for ${data.sessionId}`);
        client.emit('sessionAlreadyProcessing', { sessionId: data.sessionId });
        return;
      }
      this.recentEndedSessions.set(data.sessionId, now);

      const result = await this.analyticsService.endSession(data);

      if (!result.session) {
        client.emit('sessionNotFound', { 
          sessionId: data.sessionId,
          message: 'Session not found or already ended',
        });
        return;
      }

      // If the session was already ended, notify the caller
      if (result.alreadyEnded) {
        client.emit('sessionAlreadyEnded', {
          sessionId: result.session.sessionId,
          message: 'Session was already ended',
        });
        return;
      }

      client.emit('sessionEnded', { 
        sessionId: result.session.sessionId,
        duration: result.session.duration,
      });
      
      // Broadcast to admin clients
      this.broadcastToAdmins('sessionEnded', {
        sessionId: result.session.sessionId,
        duration: result.session.duration,
        pageViews: result.session.pageViews,
        timestamp: result.session.endTime,
      });
      
      this.logger.log(`Session ended via WebSocket: ${result.session.sessionId}`);
      // schedule cleanup for debounce map after 5 seconds
      setTimeout(() => this.recentEndedSessions.delete(data.sessionId), 5000);
    } catch (error) {
      this.logger.error(`Error ending session: ${error.message}`, error.stack);
      client.emit('exception', { 
        message: 'Failed to end session', 
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('trackPageView')
  async handleTrackPageView(
    @MessageBody() data: TrackPageViewDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const pageView = await this.analyticsService.trackPageView(data);
      
      // Update client activity
      const clientData = this.connectedClients.get(client.id);
      if (clientData) {
        clientData.lastActivity = new Date();
      }
      
      client.emit('pageViewTracked', { 
        path: pageView.path,
        timestamp: pageView.timestamp,
      });
      
      // Broadcast to admin clients for real-time monitoring
      this.broadcastToAdmins('newPageView', {
        path: pageView.path,
        title: pageView.title,
        visitorId: pageView.visitorId,
        sessionId: pageView.sessionId,
        timestamp: pageView.timestamp,
      });
      
      this.logger.log(`Page view tracked via WebSocket: ${pageView.path}`);
    } catch (error) {
      this.logger.error(`Error tracking page view: ${error.message}`, error.stack);
      client.emit('exception', { 
        message: 'Failed to track page view', 
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('updateTimeSpent')
  async handleUpdateTimeSpent(
    @MessageBody() data: { sessionId: string; path: string; timeSpent: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      await this.analyticsService.updatePageViewTimeSpent(
        data.sessionId,
        data.path,
        data.timeSpent,
      );
      
      client.emit('timeSpentUpdated', { 
        path: data.path,
        timeSpent: data.timeSpent,
      });
      
      this.logger.log(`Time spent updated via WebSocket: ${data.timeSpent}s on ${data.path}`);
    } catch (error) {
      this.logger.error(`Error updating time spent: ${error.message}`, error.stack);
      client.emit('exception', { 
        message: 'Failed to update time spent', 
        statusCode: 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const clientData = this.connectedClients.get(client.id);
    if (clientData) {
      clientData.lastActivity = new Date();
    }
    client.emit('heartbeat', { timestamp: new Date() });
  }

  @SubscribeMessage('getRealTimeStats')
  async handleGetRealTimeStats(@ConnectedSocket() client: Socket) {
    try {
      if (!this.adminClients.has(client.id)) {
        throw new Error('Unauthorized: Admin access required');
      }
      
      const stats = await this.analyticsService.getRealTimeStats();
      client.emit('realTimeStats', stats);
    } catch (error) {
      this.logger.error(`Error getting real-time stats: ${error.message}`, error.stack);
      client.emit('exception', { 
        message: error.message, 
        statusCode: error.message.includes('Unauthorized') ? 401 : 500,
        timestamp: new Date().toISOString()
      });
    }
  }

  private async broadcastRealTimeStats() {
    try {
      if (this.adminClients.size === 0) return;
      
      const stats = await this.analyticsService.getRealTimeStats();
      this.broadcastToAdmins('realTimeStats', stats);
    } catch (error) {
      this.logger.error(`Error broadcasting real-time stats: ${error.message}`, error.stack);
    }
  }

  private async broadcastActiveUsersCount() {
    const activeUsers = this.connectedClients.size;
    this.broadcastToAdmins('activeUsersUpdate', { activeUsers });
  }

  private broadcastToAdmins(event: string, data: any) {
    this.adminClients.forEach(clientId => {
      const client = this.server.sockets.sockets.get(clientId);
      if (client) {
        client.emit(event, data);
      }
    });
  }

  // Public method for other services to broadcast analytics events
  public broadcastAnalyticsEvent(event: string, data: any) {
    this.broadcastToAdmins(event, data);
  }

  // Cleanup method
  public onModuleDestroy() {
    if (this.realTimeStatsInterval) {
      clearInterval(this.realTimeStatsInterval);
    }
  }
}