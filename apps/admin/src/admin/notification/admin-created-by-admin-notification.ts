import { Injectable } from '@nestjs/common';
import { Admin, NotificationType } from '@libs/orm';
import { AbstractNotificationEvent } from '@libs/notification/contract/event/abstract-notification-event';
import { MailNotificationEvent, ToMailData } from '@libs/notification/contract/event/mail-notification-event';
import { UserMailReceiver } from '@libs/notification/service/receiver/user-email-receiver';
import { EntityManager } from '@mikro-orm/core';
import urlConfig from '../../../../../config/url.config';

export type AdminCreatedByAdminData = {
    user: Admin;
    password: string;
};

@Injectable()
export class AdminCreatedByAdminNotification
    extends AbstractNotificationEvent<AdminCreatedByAdminData>
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
                subject: 'Welcome to the Admin Portal',
                template: 'admin-created-by-admin',
                context: {
                    ...context,
                    email: user.email,
                    url: urlConfig.adminPanelUrl,
                },
            },
        };
    }
}
