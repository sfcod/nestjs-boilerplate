import { NestExpressApplication } from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { createDocument } from './swagger.document';
import { ClientModule } from './client.module';
import { bootstrapApplication } from '../../bootstrap';
import corsConfig from '../../../config/cors.config';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { UnauthorizedExceptionFilter } from '@libs/security';
import * as bodyParser from 'body-parser';
import { microserviceInService } from '../../in-service';
import { connectRmqMicroservice } from '@libs/core';

export const instance = async (): Promise<NestExpressApplication> => {
    const app = await NestFactory.create<NestExpressApplication>(ClientModule, {
        bodyParser: false,
    });

    await bootstrapApplication(app, ClientModule);

    const rawBodyBuffer = (req, res, buffer, encoding) => {
        const excludedPaths = [];

        const process = excludedPaths.some((path) => req.path.startsWith(path));
        if (!process) {
            return;
        }

        if (buffer && buffer.length) {
            req.rawBody = buffer.toString(encoding || 'utf8');
        }
    };
    app.use(bodyParser.urlencoded({ verify: rawBodyBuffer, extended: true }));
    app.use(bodyParser.json({ verify: rawBodyBuffer }));

    SwaggerModule.setup('api-client', app, await createDocument(app));

    app.useGlobalFilters(new UnauthorizedExceptionFilter());
    const microservice = connectRmqMicroservice(app, 'client_queue');

    await microserviceInService(microservice);

    // Security configs
    app.enableCors(corsConfig);
    app.use(helmet());
    // Body limits
    app.use(json({ limit: '50mb' }));
    app.use(urlencoded({ extended: true, limit: '50mb' }));

    await app.startAllMicroservices();
    await app.listen(parseInt(process.env.PORT_CLIENT, 10) || 3010);

    return app;
};
