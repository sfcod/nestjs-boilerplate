import { Inject, Injectable } from '@nestjs/common';
import { MAILER_OPTIONS, MAILER_TRANSPORT_FACTORY, MailerService } from '@nestjs-modules/mailer';
import { MailerOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-options.interface';
import { MailerTransportFactory } from '@nestjs-modules/mailer/dist/interfaces/mailer-transport-factory.interface';

@Injectable()
export class Mailer extends MailerService {
    constructor(
        @Inject(MAILER_OPTIONS) protected readonly mailerOptions2: MailerOptions,
        @Inject(MAILER_TRANSPORT_FACTORY) protected readonly transportFactory2: MailerTransportFactory,
    ) {
        super(mailerOptions2, transportFactory2);
    }
}
