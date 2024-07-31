import { DynamicModule, MiddlewareConsumer, Module, OnApplicationShutdown, RequestMethod } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { OrmResolver } from './service/orm-resolver';
import { EntityManagerResolver } from './service/entity-manager-resolver';
import { NestMiddlewareConsumer } from '@mikro-orm/nestjs';
import { MikroOrmMiddleware } from './middleware/mikro-orm-middleware';
import { RelatedToSubscriber } from './entity-subscriber/related-to-subscriber';
import { getConnectionServiceName } from './decorator/inject-entity-manager';

@Module({})
export class OrmCoreModule implements OnApplicationShutdown {
    constructor(private readonly moduleRef: ModuleRef) {}

    static async register(config: MikroOrmModuleSyncOptions | MikroOrmModuleSyncOptions[]): Promise<DynamicModule> {
        const ormOpts = config instanceof Array ? config : [config];

        return {
            module: OrmCoreModule,
            providers: [
                {
                    provide: MikroORM,
                    useFactory: async (): Promise<MikroORM[]> => {
                        const orms = await Promise.all(ormOpts.map(async (config) => await MikroORM.init(config)));
                        return orms;
                    },
                },
                ...ormOpts.map((connection) => ({
                    provide: getConnectionServiceName(connection.contextName),
                    useFactory: (ormResolver: OrmResolver) =>
                        ormResolver.ormByConnectionName(connection.contextName).em,
                    inject: [OrmResolver],
                })),
                {
                    provide: OrmResolver,
                    useFactory: async (orms: MikroORM[]) => {
                        return new OrmResolver(orms);
                    },
                    inject: [MikroORM],
                },
                RelatedToSubscriber,
                EntityManagerResolver,
                {
                    provide: EntityManager,
                    useExisting: EntityManagerResolver,
                },
            ],
            exports: [
                MikroORM,
                OrmResolver,
                EntityManagerResolver,
                EntityManager,
                ...ormOpts.map((connection) => getConnectionServiceName(connection.contextName)),
            ],
        };
    }

    async onApplicationShutdown() {
        const ormResolver = this.moduleRef.get<OrmResolver>(OrmResolver);

        for (const orm of ormResolver.getConnections()) {
            orm && (await orm.close());
        }
    }

    configure(consumer: MiddlewareConsumer): void {
        const isNestMiddleware = (consumer: MiddlewareConsumer): consumer is NestMiddlewareConsumer => {
            return typeof (consumer as any).httpAdapter === 'object';
        };

        const usingFastify = (consumer: NestMiddlewareConsumer) => {
            return consumer.httpAdapter.constructor.name.toLowerCase().startsWith('fastify');
        };

        const forRoutesPath = isNestMiddleware(consumer) && usingFastify(consumer) ? '(.*)' : '*';

        consumer
            .apply(MikroOrmMiddleware) // register request context automatically
            .forRoutes({ path: forRoutesPath, method: RequestMethod.ALL });
    }
}
