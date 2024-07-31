import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { names } from '@libs/core';
import { ClientModule } from './client.module';
import { readFileSync } from 'fs';

export const createDocument = async (app) => {
    const options = new DocumentBuilder()
        .setTitle('Client Api')
        .setDescription(readFileSync(join(__dirname, '/', 'description.md'), { encoding: 'utf-8' }))
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    // const modules = await names(join(__dirname, '/*/*.module{.ts,.js}'));
    const dto = await names(join(__dirname, '/**/*{input,output}{.ts,.js}'));
    const entities = []; //await names(join(__dirname, '/../../modules/orm/entity/**/*.js'));

    const document = SwaggerModule.createDocument(app, options, {
        include: [ClientModule],
        extraModels: [...entities, ...dto],
        deepScanRoutes: true,
    });

    const filter = (obj, predicate) =>
        Object.keys(obj)
            .filter((key) => predicate(obj[key]))
            .reduce((res, key) => ((res[key] = obj[key]), res), {});
    document.paths = filter(document.paths, (path) => {
        return !!path[Object.keys(path)[0]].tags;
    });

    document.components.schemas = filter(document.components.schemas, (schema) => {
        return Object.values(schema.properties).length > 0;
    });

    return document;
};
