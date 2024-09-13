import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', true);
  app.enableCors({
    // origin: ['http://localhost:3000', 'http://0.0.0.0:3000'], // Dev
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // const swaggerConfig = new DocumentBuilder()
  //   .setTitle('EWSN')
  //   .setDescription('EWSN API DOCS')
  //   .setVersion('0.1')
  //   .addBearerAuth(
  //     {
  //       type: 'http',
  //       scheme: 'bearer',
  //       in: 'header',
  //       name: 'JWT',
  //     },
  //     'access-token',
  //   )
  //   .build();

  // const document = SwaggerModule.createDocument(app, swaggerConfig);
  // SwaggerModule.setup('api', app, document, {
  //   swaggerOptions: {
  //     tagsSorter: 'alpha',
  //     operationsSorter: 'method',
  //   },
  // });

  app.enableShutdownHooks();

  await app.listen(8000);
}
bootstrap();
