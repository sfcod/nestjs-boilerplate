import { DynamicModule, Global, Module, ValueProvider } from '@nestjs/common';
import { MAILER_OPTIONS, MailerModule as NodeMailerModule } from '@nestjs-modules/mailer';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { Mailer } from './service/mailer';

@Global()
@Module({})
export class MailerModule {
    static register(config: MailerOptions): DynamicModule {
        const MailerOptionsProvider: ValueProvider<MailerOptions> = {
            provide: MAILER_OPTIONS,
            useValue: config,
        };
        return {
            module: MailerModule,
            providers: [MailerOptionsProvider, Mailer],
            imports: [NodeMailerModule.forRoot(config)],
            exports: [NodeMailerModule, Mailer],
        };
    }
}
