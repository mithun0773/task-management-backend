import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable Global Validation Pipe (Checks DTOs automatically)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not in DTO
      forbidNonWhitelisted: true, // Throws error if extra properties sent
      transform: true, // Auto-transforms payloads to DTO objects
    }),
  );

  // Enable CORS so React frontend can talk to backend
  app.enableCors({
    origin: 'http://localhost:5173', // Your Vite frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Setup Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Task Management API')
    .setDescription('API for Task & Project Management System')
    .setVersion('1.0')
    .addBearerAuth() // Adds "Authorize" button in Swagger for JWT
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server Running: http://localhost:${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api`);
}
bootstrap();
