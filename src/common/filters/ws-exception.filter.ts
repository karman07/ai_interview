import { ArgumentsHost, Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class AllWsExceptionsFilter implements WsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();

    let message = 'Unknown WebSocket error';
    if (exception instanceof WsException) {
      message = exception.getError() as string;
    } else if (exception instanceof Error) {
      message = exception.message;
    } else if (typeof exception === 'string') {
      message = exception;
    } else if (typeof exception === 'object') {
      message = JSON.stringify(exception);
    }

    client.emit('error', { message });
  }
}
