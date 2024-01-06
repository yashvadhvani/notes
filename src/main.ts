import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadEnvConfig } from './config.env';

async function bootstrap() {
  loadEnvConfig();
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Notes example')
    .setDescription('The Notes API description')
    .setVersion('1.0')
    .addTag('notes')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
