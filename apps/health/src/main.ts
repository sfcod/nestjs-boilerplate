import 'reflect-metadata';
import '../../polyfills';
import { bootstrapApplication } from '../../bootstrap';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    // Welcome app
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // app.enableCors({
    //     origin: new RegExp('.*'),
    // });
    await bootstrapApplication(app, AppModule);
    const port = parseInt(process.env.PORT_HEALTH, 10) || 3001;
    await app.listen(port);
    new Logger('Bootstrap').log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
