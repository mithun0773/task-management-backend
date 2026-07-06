import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);

  console.log(
    await dataSource.query(`
SELECT current_database(),
       current_schema(),
       current_user
`),
  );

  console.log(
    await dataSource.query(`
SELECT tablename
FROM pg_tables
WHERE schemaname='public'
`),
  );
  // Enable Global Validation Pipe (Checks DTOs automatically)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: ['http://localhost:5173', process.env.FRONTEND_URL],
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
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📚 Swagger Docs: http://localhost:${port}/api`);
}
bootstrap();
