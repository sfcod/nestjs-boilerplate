import { DynamicModule, Module } from '@nestjs/common';
import { SoftDeleteModule } from '@libs/soft-delete';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings';
import { OrmCoreModule } from '@libs/orm-core';

export const MIKRO_ORM_DEFAULT = 'default';

@Module({})
export class OrmModule {
    static register(config: MikroOrmModuleSyncOptions | MikroOrmModuleSyncOptions[]): DynamicModule {
        return {
            module: OrmModule,
            global: true,
            imports: [OrmCoreModule.register(config), SoftDeleteModule],
            providers: [],
            exports: [OrmCoreModule],
        };
    }
}
