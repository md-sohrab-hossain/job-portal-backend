/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();
async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE, OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
