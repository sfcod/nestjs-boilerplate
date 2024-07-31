import { DynamicModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({})
export class CommandModule {
    static register(): DynamicModule {
        return {
            module: CommandModule,
            controllers: [],
            imports: [
                HttpModule.register({
                    // One minute
                    timeout: 60000,
                }),
            ],
            providers: [],
        };
    }
}
