import { DynamicModule, Global, Module } from '@nestjs/common';
import * as Twilio from 'twilio';
import { WebhookRequestValidator } from './service/webhook-request-validator';
import { SmsSender } from './service/sms-sender';

export type TwilioModuleOptions = {
    accountSid: string;
    authToken: string;
    keySid: string;
    keySecret: string;
    pushCredentialSid: string;
};

@Global()
@Module({})
export class TwilioModule {
    static register(options: TwilioModuleOptions): DynamicModule {
        return {
            module: TwilioModule,
            imports: [],
            exports: [WebhookRequestValidator, SmsSender],
            providers: [
                {
                    provide: Twilio.Twilio,
                    useFactory: () => {
                        return Twilio(options.accountSid, options.authToken);
                    },
                },
                {
                    provide: 'TWILIO_CREDENTIALS',
                    useValue: { ...options },
                },
                WebhookRequestValidator,
                SmsSender,
            ],
        };
    }
}
