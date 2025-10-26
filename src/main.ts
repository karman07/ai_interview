import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { AllWsExceptionsFilter } from './common/filters/ws-exception.filter';

const logger = new Logger('Bootstrap');

class RedisIoAdapter extends IoAdapter {
  private adapter: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      logger.log(`🔗 Connecting to Redis at: ${redisUrl}`);

      const pubClient = createClient({
        url: redisUrl,
        socket: { connectTimeout: 5000 },
      });
      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);
      this.adapter = createAdapter(pubClient, subClient);

      logger.log('✅ Redis connected successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to Redis. Using in-memory adapter.');
      logger.error(error);
      this.adapter = null;
    }
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    if (this.adapter) {
      server.adapter(this.adapter);
      logger.log('🚀 WebSocket Redis adapter in use');
    } else {
      logger.warn('⚠️ Using in-memory WebSocket adapter');
    }
    return server;
  }
}

async function bootstrap() {
  logger.log('🧠 Bootstrapping NestJS application...');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global error handling
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', reason);
  });
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
  });

  // Validation and filters
  app.useGlobalFilters(new AllWsExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Static file setup
  const resumeDir = path.resolve(process.env.UPLOAD_DIR ?? 'uploads/resumes');
  const profileDir = path.resolve('uploads/profile-images');
  [resumeDir, profileDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('AI Interview')
    .setDescription('Auth + User Profile API with Google & uploads')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Redis Adapter setup
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

  // Final server start
  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Server ready at http://localhost:${port}`);
  logger.log(`📘 Swagger UI available at http://localhost:${port}/docs`);
  logger.log(`📂 Serving uploads from /uploads`);
}

bootstrap();
