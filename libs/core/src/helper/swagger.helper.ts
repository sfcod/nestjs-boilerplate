import { resolve } from 'path';
import { GlobOptionsWithFileTypesFalse, sync } from 'glob';
import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

type SetupSwaggerOptions = { path: string; document: OpenAPIObject; secured?: boolean };
export const setupSwagger = async (app: INestApplication, { path, document, secured = true }: SetupSwaggerOptions) => {
    if (secured) {
        const user = process.env.SWAGGER_USER || 'swagger';
        const pass = process.env.SWAGGER_PASSWORD || 'swagger';
        const auth = basicAuth({ challenge: true, users: { [user]: pass } });

        app.use(path, auth);
        app.use(`${path}-yaml`, auth);
        app.use(`${path}-json`, auth);
    }

    SwaggerModule.setup(path, app, document);
};

export const names = async (globPattern: string, options?: GlobOptionsWithFileTypesFalse) => {
    const all = await Promise.all(
        sync(globPattern, options).map((file: string) => {
            return import(resolve(file));
        }),
    );

    return all.map((module) => {
        return Object.values(module)[0] as any;
    });
};
