import { DynamicModule, Module } from '@nestjs/common';
import { SoftDeleteModule } from '@libs/soft-delete';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({})
export class OrmModule {
    static register(config: MikroOrmModuleSyncOptions): DynamicModule {
        return {
            module: OrmModule,
            global: true,
            imports: [MikroOrmModule.forRoot(config), SoftDeleteModule],
        };
    }
}
