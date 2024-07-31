import { NestFactory } from '@nestjs/core';
import { DatabaseModule } from './database.module';
import { INestApplicationContext } from '@nestjs/common';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function bootstrap(module = DatabaseModule): Promise<INestApplicationContext> {
    const context = await NestFactory.createApplicationContext(DatabaseModule, { logger: ['error', 'debug'] });

    return context;
}

export { bootstrap };
