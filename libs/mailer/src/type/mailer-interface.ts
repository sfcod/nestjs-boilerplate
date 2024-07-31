import { ISendMailOptions } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { SentMessageInfo } from 'nodemailer';

export interface MailerInterface {
    sendMail(sendMailOptions: ISendMailOptions): Promise<SentMessageInfo | any>;
}
