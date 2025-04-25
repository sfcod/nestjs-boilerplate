import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AdminPanelModule } from './admin-panel.module';
import { createDocument } from './swagger.document';
import corsConfig from '../../../config/cors.config';
import { bootstrapApplication } from '../../bootstrap';
import helmet from 'helmet';
import { urlencoded, json } from 'express';
import { microserviceInService } from '../../in-service';
import { connectRmqMicroservice, setupSwagger } from '@libs/core';

export const instance = async (): Promise<NestExpressApplication> => {
    const app = await NestFactory.create<NestExpressApplication>(AdminPanelModule);

    await bootstrapApplication(app, AdminPanelModule);

    await setupSwagger(app, { path: '/api-admin', document: await createDocument(app), secured: true });

    const microservice = connectRmqMicroservice(app, 'admin_queue');

    await microserviceInService(microservice);

    // Security configs
    app.enableCors(corsConfig);
    app.use(helmet());
    // Body limits
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    await app.startAllMicroservices();
    await app.listen(parseInt(process.env.PORT_ADMIN, 10) || 3040);

    return app;
};
