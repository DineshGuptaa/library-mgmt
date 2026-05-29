import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { ElkLogger } from './common/elk-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ElkLogger(),
  });

  app.use(cookieParser());

  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error if unknown properties are sent
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription(
      `
This NestJS project demonstrates a Library Management System backend with TypeORM + PostgreSQL.

Features:
• MembersModule: Manage library members
• MembershipCardModule: Handle membership cards linked to members
• AuthorsModule & BooksModule: Manage authors and books
• BorrowingModule: Track borrowings of books by members
• PostgreSQL database with TypeORM
• Validation using class-validator
• Swagger documentation for all endpoints
    `,
    )
    .setVersion('1.0')
    .setTermsOfService('http://localhost:3000/terms')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.getHttpAdapter().get('/api-json', (req, res) => {
    res.json(document);
  });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log('Swagger docs available at: /api');
}

bootstrap();
