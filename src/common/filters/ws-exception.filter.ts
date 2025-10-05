import { ArgumentsHost, Catch, WsExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class AllWsExceptionsFilter implements WsExceptionFilter {
  private readonly logger = new Logger(AllWsExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // Check if this is actually a WebSocket context
    try {
      const contextType = host.getType();
      if (contextType !== 'ws') {
        // This is not a WebSocket context, ignore the error
        return;
      }
    } catch (contextError) {
      // If we can't determine context, it's likely not a WebSocket error
      return;
    }

    const client: Socket = host.switchToWs().getClient();

    let message = 'Unknown WebSocket error';
    let statusCode = 500;
    let shouldLog = true;

    if (exception instanceof WsException) {
      const error = exception.getError();
      if (typeof error === 'string') {
        message = error;
      } else if (typeof error === 'object' && error !== null) {
        message = (error as any).message || 'WebSocket error';
        statusCode = (error as any).statusCode || 400;
      } else {
        message = 'WebSocket error';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      
      // Handle HTTP routing errors that shouldn't be in WebSocket context
      if (message.includes('Cannot GET') || message.includes('Cannot POST') || 
          message.includes('Cannot PUT') || message.includes('Cannot DELETE')) {
        // This is likely an HTTP request being processed by WebSocket handler
        this.logger.debug(`HTTP request incorrectly routed to WebSocket: ${message}`);
        return; // Don't process HTTP requests in WebSocket context
      }
      
      if (exception.message === 'Unauthorized') {
        statusCode = 401;
      } else if (exception.name === 'NotFoundException') {
        statusCode = 404;
        // Don't log 404s as errors, they're usually expected
        shouldLog = false;
      }
    } else if (typeof exception === 'string') {
      message = exception;
    } else if (typeof exception === 'object' && exception !== null) {
      message = (exception as any).message || JSON.stringify(exception);
      if ((exception as any).message === 'Unauthorized') {
        statusCode = 401;
      }
    }

    // Smart logging based on error type and severity
    if (shouldLog) {
      if (statusCode >= 500 || !message.includes('Session not found')) {
        this.logger.error(`WebSocket Error: ${message}`, exception);
      } else {
        this.logger.debug(`WebSocket Warning: ${message}`);
      }
    }

    // Only emit if client is connected and this is a valid WebSocket error
    if (client && client.connected && typeof client.emit === 'function') {
      try {
        // Don't emit HTTP routing errors to WebSocket clients
        if (!message.includes('Cannot GET') && !message.includes('Cannot POST') && 
            !message.includes('Cannot PUT') && !message.includes('Cannot DELETE')) {
          client.emit('exception', { 
            message, 
            statusCode,
            timestamp: new Date().toISOString()
          });
        }
      } catch (emitError) {
        this.logger.debug('Client disconnected while emitting error response');
      }
    } else {
      this.logger.debug('Client disconnected, skipping error emission');
    }
  }
}
