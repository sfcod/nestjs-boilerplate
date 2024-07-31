import { DynamicModule, Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({})
export class MicroserviceEventModule {
    static register(): DynamicModule {
        return {
            module: MicroserviceEventModule,
            providers: [],
            exports: [],
            imports: [
                HttpModule.register({
                    // Two minutes
                    timeout: 120000,
                }),
            ],
        };
    }
}
