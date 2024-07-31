import '../../../../apps/polyfills';
import { INestApplication, Type } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { bootstrapApplication, bootstrapMicroservice } from '../../../../apps/bootstrap';
import { EntityManagerResolver } from '@libs/orm-core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as request from 'supertest';
import supertest, { SuperTest } from 'supertest';
import { MIKRO_ORM_DEFAULT } from '@libs/orm';

export type FakeModule = {
    instance: any;
    instanceClass: any;
};

type BootstrapParams = {
    module: any;
    flowType?: 'application' | 'microservice';
};

export class Bootstrap {
    private static na: INestApplication = null;
    private static prev: BootstrapParams = null;
    private static isFakeApp = false;

    public static getHttpRequest(): SuperTest<supertest.Test> {
        return request(this.na.getHttpServer());
    }

    public static getRpcRequest() {
        return this.get('MICROSERVICE_BROKER');
    }

    public static async setup(params?: BootstrapParams, fakeModule?: FakeModule): Promise<INestApplication> {
        if (this.na && fakeModule) {
            await this.na.close();
            this.isFakeApp = true;
        } else if (this.na) {
            throw new Error('Application was setup');
        }

        const na = await (async () => {
            switch (params.flowType || 'application') {
                case 'microservice':
                    return Bootstrap.setupMicroservice(params, fakeModule);
                case 'application':
                    return Bootstrap.setupApplication(params, fakeModule);
            }
        })();

        // Init na
        // Bootstrap.id = params.id;
        const application = await na.init();

        // Truncate
        // (params.truncate || params.truncateTables) && (await Bootstrap.truncateTables(application));
        // (params.truncate || params.truncateCollections) && (await Bootstrap.truncateCollections(application));

        application.enableShutdownHooks();
        Bootstrap.prev = Bootstrap.prev ? Bootstrap.prev : params;
        Bootstrap.na = application;

        return application;
    }

    /**
     * Return clear EM without any subsciber inside. It is totally clear EM with entities.
     * @param connectionName
     */
    public static getEntityManager(connectionName: string = MIKRO_ORM_DEFAULT): EntityManagerResolver {
        const na = Bootstrap.na;
        const em = na.get<EntityManagerResolver>(EntityManagerResolver);

        return em.getEntityManager(connectionName).fork({ clear: true, useContext: false, freshEventManager: true });
    }

    public static get<T = any>(type: Type<T> | string): T {
        return Bootstrap.na.get<T>(type);
    }

    public static async resolve(name: any) {
        return await Bootstrap.na.resolve(name);
    }

    public static async close() {
        await this.na.close();
        if (this.isFakeApp) {
            this.na = null;
            this.isFakeApp = false;
            await this.setup(this.prev);
        } else {
            global.gc && global.gc();
        }
    }

    private static async setupApplication(params: BootstrapParams, fakeModule?: FakeModule): Promise<INestApplication> {
        const instance = fakeModule
            ? fakeModule.instance
            : await Test.createTestingModule({
                  imports: [params.module],
              }).compile();
        const na = instance.createNestApplication();
        await bootstrapApplication(na, fakeModule ? fakeModule.instanceClass : params.module);

        return na;
    }

    private static async setupMicroservice(
        params: BootstrapParams,
        fakeModule?: FakeModule,
    ): Promise<INestApplication> {
        const instance = fakeModule
            ? fakeModule.instance
            : await Test.createTestingModule({
                  imports: [
                      params.module,
                      ClientsModule.register([
                          {
                              name: 'MICROSERVICE_BROKER',
                              transport: Transport.TCP,
                          },
                      ]),
                  ],
              }).compile();
        const na = instance.createNestMicroservice({
            transport: Transport.TCP,
        });
        await bootstrapMicroservice(na, fakeModule ? fakeModule.instanceClass : params.module);
        await na.listen();

        return na;
    }
}
