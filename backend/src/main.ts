import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cho phép React Frontend gọi API
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Validation DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 Backend running at http://localhost:${process.env.PORT ?? 3000}`,
  );
}

bootstrap();