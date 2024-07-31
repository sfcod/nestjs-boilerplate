import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { bootstrapMicroservice } from '../../bootstrap';
import { DatabaseModule } from '@app/database/database.module';
import { INestMicroservice } from '@nestjs/common';

export const instance = async (): Promise<INestMicroservice> => {
    const app = await NestFactory.createMicroservice<NestExpressApplication>(DatabaseModule);

    await bootstrapMicroservice(app, DatabaseModule);
    await app.init();

    return app;
};
