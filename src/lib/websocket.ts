import { io, Socket } from 'socket.io-client';

export interface WebSocketManager {
  socket: Socket | null;
  connect: (visitorId: string, sessionId: string, userId?: string) => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  isConnected: () => boolean;
}

class AnalyticsWebSocketManager implements WebSocketManager {
  public socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(visitorId: string, sessionId: string, userId?: string) {
    if (this.socket?.connected) {
      console.log('🔌 WebSocket: Already connected');
      return;
    }

    const baseUrl = 'http://localhost:3000'; // Fixed WebSocket base URL
    
    console.log('🔌 WebSocket: Connecting to analytics namespace...', {
      visitorId: visitorId.slice(0, 15) + '...',
      sessionId: sessionId.slice(0, 15) + '...',
      userId,
      url: `${baseUrl}/analytics`
    });

    this.socket = io(`${baseUrl}/analytics`, {
      query: {
        visitorId,
        sessionId,
        userId: userId || '',
        userAgent: navigator.userAgent,
        country: 'Unknown', // You can detect this if needed
        device: this.getDeviceType(),
        isAdmin: 'false'
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.setupEventListeners();
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 WebSocket: Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      console.log(`🔌 WebSocket: Emitting ${event}:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`🔌 WebSocket: Cannot emit ${event} - not connected`);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket: Connected to analytics namespace');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket: Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket: Connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 WebSocket: Reconnected after ${attemptNumber} attempts`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ WebSocket: Failed to reconnect after maximum attempts');
    });

    // Analytics-specific events
    this.socket.on('sessionStarted', (data) => {
      console.log('✅ WebSocket: Session started confirmation:', data);
    });

    this.socket.on('sessionEnded', (data) => {
      console.log('✅ WebSocket: Session ended confirmation:', data);
    });

    this.socket.on('pageViewTracked', (data) => {
      console.log('✅ WebSocket: Page view tracked confirmation:', data);
    });

    this.socket.on('timeSpentUpdated', (data) => {
      console.log('✅ WebSocket: Time spent updated confirmation:', data);
    });

    this.socket.on('heartbeat', (data) => {
      console.log('💓 WebSocket: Heartbeat response:', data);
    });

    this.socket.on('exception', (error) => {
      console.error('❌ WebSocket: Server exception:', error);
    });
  }

  private getDeviceType(): string {
    if (typeof window === 'undefined') return 'desktop';
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\\sce|palm|smartphone|iemobile/.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }
}

// Export singleton instance
export const analyticsWebSocket = new AnalyticsWebSocketManager();