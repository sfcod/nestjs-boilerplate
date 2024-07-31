import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';

@Global()
@Module({})
export class CommonModule {
    static register(): DynamicModule {
        return {
            module: CommonModule,
            exports: [ClientsModule],
            imports: [],
        };
    }
}
