import { ISendMailOptions } from '@nestjs-modules/mailer';
import { MailReceiverInterface } from './../receiver/mail-receiver-interface';

export type Mailer = 'mailer';

export type ToMailData = {
    receiver: MailReceiverInterface;
    mail: Omit<ISendMailOptions, 'to'>;
    mailer?: Mailer | Mailer[];
};

export interface MailNotificationEvent {
    toMail(): Promise<ToMailData>;
}
