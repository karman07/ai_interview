import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AllWsExceptionsFilter } from './common/filters/ws-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    logger.log('🚀 Starting application...');
    
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log', 'debug'],
      abortOnError: false, // Don't abort on non-critical errors
    });

    // Global error handling for unhandled rejections and exceptions
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
    });

  // Apply global filters, pipes, and interceptors
  app.useGlobalFilters(new AllWsExceptionsFilter());
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
  app.useGlobalInterceptors(new TimeoutInterceptor(30000)); // 30 second timeout

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

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📂 Uploads served at http://localhost:${port}/uploads/`);
  logger.log(`🔗 AI Interview API: ${process.env.AI_INTERVIEW_API_BASE_URL || 'http://34.27.237.113:8000'}`);
  logger.log('✅ Application started successfully!');
  
  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch(err => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
