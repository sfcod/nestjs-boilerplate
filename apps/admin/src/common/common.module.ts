import { DynamicModule, Global, Module } from '@nestjs/common';

@Global()
@Module({})
export class CommonModule {
    static register(): DynamicModule {
        return {
            module: CommonModule,
            imports: [],
            exports: [],
            providers: [],
        };
    }
}
