import 'reflect-metadata';
import '../../polyfills';
import { bootstrapApplication } from '../../bootstrap';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
    // Welcome app
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    // app.enableCors({
    //     origin: new RegExp('.*'),
    // });
    await bootstrapApplication(app, AppModule);
    await app.listen(parseInt(process.env.PORT_HEALTH, 10) || 3001);
}

bootstrap();
