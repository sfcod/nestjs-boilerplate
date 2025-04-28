import { NestExpressApplication } from '@nestjs/platform-express';
import { ClassSerializerInterceptor, INestApplication, INestMicroservice, Type, ValidationPipe } from '@nestjs/common';
import {
    AsyncSerializerInterceptor,
    deviceMiddleware,
    validationHttpExceptionFactory,
    validationRpcExceptionFactory,
} from '@libs/core';
import { Reflector } from '@nestjs/core';
import { useContainer } from 'class-validator';
import { join } from 'path';
import { path as appRoot } from 'app-root-path';
import { NestMicroservice } from '@nestjs/microservices';

async function bootstrap(app: INestMicroservice | INestApplication, module: Type<any>) {
    // const app = await AppContext.instance(); //await NestFactory.create(AppModule);
    // TODO: find another solution (stopAtFirstError not globally)
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            exceptionFactory:
                app instanceof NestMicroservice ? validationRpcExceptionFactory : validationHttpExceptionFactory,
            stopAtFirstError: true,
        }),
    );

    // Implemented aggregator of containers
    // useContainer(validatorContainer.add(app.select(module)), { fallbackOnErrors: true });
    useContainer(app.select(module), { fallbackOnErrors: true });
}

export async function bootstrapApplication(app: NestExpressApplication, module: Type<any>) {
    await bootstrap(app, module);

    app.use(deviceMiddleware);
    app.useGlobalInterceptors(
        new AsyncSerializerInterceptor(),
        new ClassSerializerInterceptor(new Reflector(), { strategy: 'excludeAll' }),
    );
    app.useStaticAssets(join(appRoot, 'public'));
    app.useStaticAssets(join(appRoot, 'storage'));
    app.setBaseViewsDir(join(appRoot, 'templates/views'));
    app.setViewEngine('hbs');
}

export async function bootstrapMicroservice(app: INestMicroservice, module: Type<any>) {
    // Bootstrap microservice
    await bootstrap(app, module);
    // Filters. Old filter: new RpcExceptionFilter()
}
