import { Injectable, Logger } from '@nestjs/common';
import { MailReceiverInterface } from '../contract/receiver/mail-receiver-interface';
import { NotificationManagerInterface } from '../contract/notification-manager.interface';
import { Mailer as MailerType, ToMailData } from '../contract/event/mail-notification-event';
import { createHash, Mailer } from '@libs/mailer';

@Injectable()
export class MailNotificationManager implements NotificationManagerInterface {
    protected readonly logger = new Logger(this.constructor.name);

    constructor(private readonly mailer: Mailer) {}

    public async process(
        receiver: MailReceiverInterface,
        mail: ToMailData['mail'],
        mailer: ToMailData['mailer'],
    ): Promise<void> {
        if (await receiver.isEmailEnabled()) {
            const email = await receiver.getEmail();
            const hash = await createHash(email);
            let chain: MailerType[];
            if (process.env.NODE_ENV === 'test') {
                chain = ['mailer'];
            } else {
                chain = Array.isArray(mailer)
                    ? mailer
                    : ([mailer || process.env.MAIL_NOTIFICATION_MAILER || 'mailer'] as MailerType[]);
            }
            for (const mailer of chain) {
                try {
                    await this[mailer].sendMail({
                        ...mail,
                        to: email,
                        context: {
                            ...mail.context,
                            __isChain: chain.length > 1,
                            __template: await receiver.getTemplate(),
                            __unsubscribe_email: email,
                            __unsubscribe_hash: hash,
                        },
                    });
                } catch (e) {
                    this.logger.error(e.message, e.stack);
                }
            }
        }
    }
}
