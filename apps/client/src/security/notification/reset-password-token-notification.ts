import { Injectable } from '@nestjs/common';
import { NotificationType, User } from '@libs/orm';
import { AbstractNotificationEvent, MailNotificationEvent, ToMailData, UserMailReceiver } from '@libs/notification';
import { EntityManager } from '@mikro-orm/core';
import { Mapper } from '@libs/core';

export type ResetPasswordTokenData = {
    user: User;
    code: string;
};

@Injectable()
export class ResetPasswordTokenNotification
    extends AbstractNotificationEvent<ResetPasswordTokenData>
    implements MailNotificationEvent
{
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {
        super();
    }
    getType() {
        return NotificationType.TYPE_SYSTEM;
    }

    async toMail(): Promise<ToMailData> {
        const { user, code } = this.getData();

        return {
            receiver: new UserMailReceiver(user),
            mail: {
                subject: 'Reset your password.',
                template: 'reset-password-token',
                context: {
                    code: code,
                },
            },
        };
    }
}
