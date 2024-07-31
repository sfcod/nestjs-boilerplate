import { DynamicModule, Global, Logger, LoggerService, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UniqueEntityConstraint } from './validator/unique-entity.validator';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Paginator } from './service/paginator';
import { ExistsEntityConstraint } from './validator/exists-entity.validator';
import { CodeGenerator } from './service/code-generator';
import { RedlockResolver } from './service/redlock-resolver';
import { Output } from './service/output';
import { Mapper } from './service/mapper';
import { EventEmitterModuleOptions } from '@nestjs/event-emitter/dist/interfaces';
import { JsonMaxSizeConstraint } from './validator/json-max-size.validator';
import { OneOfFieldsConstraint } from './validator/one-of-fields.validator';
import { EXECUTION_LOGGER } from './constant/service-constant';
import { CacheModuleOptions } from '@nestjs/cache-manager';
import { CallbackConstraint } from './validator/callback.validator';
import { PasswordValidation } from './validator/password.validator';
import { ChecksumProvider } from './service/checksum-generator';

export interface CoreOptions {
    eventEmitter: EventEmitterModuleOptions;
    cache?: CacheModuleOptions;
}

@Global()
@Module({})
export class CoreModule {
    static executionLogger() {
        return {
            provide: EXECUTION_LOGGER,
            useFactory: (): LoggerService => {
                return new Logger(EXECUTION_LOGGER);
            },
        };
    }

    static register(options: CoreOptions): DynamicModule {
        const { eventEmitter, cache = {} } = options;
        const cacheModule = CacheModule.register(cache);
        const eventEmitterModule = EventEmitterModule.forRoot(eventEmitter);
        const executionLogger = this.executionLogger();

        return {
            module: CoreModule,
            imports: [eventEmitterModule, cacheModule],
            controllers: [],
            providers: [
                executionLogger,
                UniqueEntityConstraint,
                Paginator,
                ExistsEntityConstraint,
                JsonMaxSizeConstraint,
                CodeGenerator,
                RedlockResolver,
                Output,
                Mapper,
                OneOfFieldsConstraint,
                CallbackConstraint,
                PasswordValidation,
                ChecksumProvider,
            ],
            exports: [
                cacheModule,
                executionLogger.provide,
                eventEmitterModule,
                Paginator,
                CodeGenerator,
                RedlockResolver,
                Output,
                Mapper,
                CallbackConstraint,
                PasswordValidation,
                ChecksumProvider,
            ],
        };
    }
}
