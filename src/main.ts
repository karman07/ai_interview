import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { AllWsExceptionsFilter } from './common/filters/ws-exception.filter';

class RedisIoAdapter extends IoAdapter {
  private adapter: ReturnType<typeof createAdapter> | null = null;

  async connectToRedis() {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      console.log(`Connecting to Redis at: ${redisUrl}`);

      const pubClient = createClient({
        url: redisUrl,
        socket: { connectTimeout: 5000 },
      });

      const subClient = pubClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.adapter = createAdapter(pubClient, subClient);

      console.log('✅ Redis adapter connected successfully for WebSocket scaling');
    } catch (error) {
      console.error('❌ Failed to connect Redis adapter. Falling back to in-memory adapter.');
      console.error(error);
      this.adapter = null;
    }
  }

  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    if (this.adapter) {
      server.adapter(this.adapter);
      console.log('🚀 Using Redis adapter for WebSocket scaling');
    } else {
      console.log('⚠️ Using in-memory adapter (single instance only)');
    }
    return server;
  }
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Global error handling for unhandled rejections and exceptions
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  // Apply global filters and pipes
  app.useGlobalFilters(new AllWsExceptionsFilter());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Ensure upload directories exist
  const resumeDir = path.resolve(process.env.UPLOAD_DIR ?? 'uploads/resumes');
  const profileDir = path.resolve('uploads/profile-images');
  [resumeDir, profileDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });

  // Serve static uploads
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('AI Interview')
    .setDescription('Auth + User Profile API with Google & uploads')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Redis Socket.io Adapter
  const redisAdapter = new RedisIoAdapter(app);
  await redisAdapter.connectToRedis();
  app.useWebSocketAdapter(redisAdapter);

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📘 Swagger at http://localhost:${port}/docs`);
  console.log(`📂 Uploads served at http://localhost:${port}/uploads/`);
}

bootstrap();
