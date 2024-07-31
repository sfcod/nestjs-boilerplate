import { Injectable } from '@nestjs/common';
import { NotificationType, User } from '@libs/orm';
import { AbstractNotificationEvent, MailNotificationEvent, ToMailData, UserMailReceiver } from '@libs/notification';
import { EntityManager } from '@mikro-orm/core';

export type EmailCodeVerificationData = {
    email: string;
    code: string;
    template?: string;
};

@Injectable()
export class EmailCodeVerificationNotification
    extends AbstractNotificationEvent<EmailCodeVerificationData>
    implements MailNotificationEvent
{
    constructor(private readonly em: EntityManager) {
        super();
    }

    getType() {
        return NotificationType.TYPE_SYSTEM;
    }

    async toMail(): Promise<ToMailData> {
        const { email, code, template = 'patient-email-verification-code' } = this.getData();
        const user = await this.em.findOne(User, { email });

        return {
            receiver: new UserMailReceiver(user),
            mail: {
                subject: 'PHY Health email verification',
                template: template,
                context: {
                    userId: user.id,
                    code,
                },
            },
        };
    }
}
