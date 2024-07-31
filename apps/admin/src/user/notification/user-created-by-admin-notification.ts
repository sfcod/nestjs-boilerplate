import { Injectable } from '@nestjs/common';
import { NotificationType, User } from '@libs/orm';
import { UserMailReceiver, MailNotificationEvent, ToMailData, AbstractNotificationEvent } from '@libs/notification';
import { EntityManager } from '@mikro-orm/core';

export type UserCreatedByAdminData = {
    user: User;
    password: string;
};

@Injectable()
export class UserCreatedByAdminNotification
    extends AbstractNotificationEvent<UserCreatedByAdminData>
    implements MailNotificationEvent
{
    constructor(private readonly em: EntityManager) {
        super();
    }
    getType() {
        return NotificationType.TYPE_SYSTEM;
    }

    async toMail(): Promise<ToMailData> {
        const { user, ...context } = this.getData();

        return {
            receiver: new UserMailReceiver(user),
            mail: {
                subject: 'Welcome to Portal',
                template: 'user-created-by-admin',
                context: {
                    ...context,
                    email: user.email,
                },
            },
        };
    }
}
