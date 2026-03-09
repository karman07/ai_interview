import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
      abortOnError: false, // Don't abort on non-critical errors
      bodyParser: false, // We will configure it manually below
    });

    // ✅ INCREASE LIMITS: Handle large resume and JD data
    // We must use 'require' or proper imports for express middlewares
    const { json, urlencoded } = require('express');
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    // Global error handling for unhandled rejections and exceptions
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('🚨 Uncaught Exception:', error);
    });

    // Log when requests are taking too long
    app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        if (duration > 5000) { // Log requests taking more than 5 seconds
          logger.warn(`⏰ Slow request: ${req.method} ${req.url} took ${duration}ms`);
        }
      });
      next();
    });

    // Apply global filters, pipes, and interceptors
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    // Global timeout disabled for AI processing - connections will never timeout
    // app.useGlobalInterceptors(new TimeoutInterceptor(360000));

    // Enable open CORS
    app.enableCors({
      origin: (origin, callback) => {
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['*'],
      exposedHeaders: ['*'],
    });

    // Ensure upload directories exist
    const resumeDir = path.resolve(process.env.UPLOAD_DIR ?? 'uploads/resumes');
    const profileDir = path.resolve('uploads/profile-images');
    const audioDir = path.resolve('uploads/audio');
    const videoDir = path.resolve('uploads/video');
    [resumeDir, profileDir, audioDir, videoDir].forEach((dir) => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });

    // Serve static uploads
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

    // Start server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`🚀 Server running on http://localhost:${port}`);

    // Server started

  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
