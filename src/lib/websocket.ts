import { io, Socket } from 'socket.io-client';

export interface WebSocketManager {
  socket: Socket | null;
  connect: (params: {
    visitorId: string;
    sessionId: string;
    userId?: string;
    userAgent: string;
    country: string;
    device: string;
    isAdmin: boolean;
  }) => void;
  disconnect: () => void;
  emit: (event: string, data: any) => void;
  isConnected: () => boolean;
}

class AnalyticsWebSocketManager implements WebSocketManager {
  public socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(params: {
    visitorId: string;
    sessionId: string;
    userId?: string;
    userAgent: string;
    country: string;
    device: string;
    isAdmin: boolean;
  }) {
    if (this.socket?.connected) return;

    const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

    this.socket = io(`${baseUrl}/analytics`, {
      query: {
        visitorId: params.visitorId,
        sessionId: params.sessionId,
        userId: params.userId || '',
        userAgent: params.userAgent,
        country: params.country,
        device: params.device,
        isAdmin: params.isAdmin ? 'true' : 'false'
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
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
    }
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect_error', (error) => {
      console.error('❌ Analytics WebSocket: Connection error:', error);
      this.reconnectAttempts++;
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Analytics WebSocket: Failed to reconnect after maximum attempts');
    });

    this.socket.on('exception', (error) => {
      console.error('❌ Analytics WebSocket: Server exception:', error);
    });
  }
}

// Export singleton instance
export const analyticsWebSocket = new AnalyticsWebSocketManager();