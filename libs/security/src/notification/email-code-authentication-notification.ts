import { Injectable } from '@nestjs/common';
import { Admin, NotificationType, User } from '@libs/orm';
import { AbstractNotificationEvent, MailNotificationEvent, ToMailData, UserMailReceiver } from '@libs/notification';
import { User2FAInterface } from '../contract/user-2fa.interface';
import { EntityManager } from '@mikro-orm/core';

export type EmailCodeAuthenticationData = {
    user: User2FAInterface;
    code: string;
    template?: string;
};

@Injectable()
export class EmailCodeAuthenticationNotification
    extends AbstractNotificationEvent<EmailCodeAuthenticationData>
    implements MailNotificationEvent
{
    constructor(private readonly em: EntityManager) {
        super();
    }

    getType() {
        return NotificationType.TYPE_SYSTEM;
    }

    async toMail(): Promise<ToMailData> {
        const { user: authUser, code, template = 'user-email-2fa-code' } = this.getData();
        const user =
            (await this.em.findOne(User, authUser.getUuid())) || (await this.em.findOne(Admin, authUser.getUuid()));

        return {
            receiver: new UserMailReceiver(user),
            mail: {
                subject: 'Your 2FA authentication code',
                template: template,
                context: {
                    code,
                },
            },
            mailer: ['mailer'],
        };
    }
}
