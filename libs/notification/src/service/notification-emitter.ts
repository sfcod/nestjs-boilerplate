import { Injectable, Logger } from '@nestjs/common';
import { AbstractNotificationEvent } from '../contract/event/abstract-notification-event';
import { ModuleRef } from '@nestjs/core';
import { DbNotificationEvent } from '../contract/event/db-notification-event';
import { PushNotificationEvent } from '../contract/event/push-notification-event';
import { MailNotificationEvent } from '../contract/event/mail-notification-event';
import { NotificationManagerInterface } from '../contract/notification-manager.interface';
import { SmsNotificationEvent } from '../contract/event/sms-notification-event';
import { Admin, User } from '@libs/orm';
import { Request } from 'express';

export type NotificationTypeClass<T> = AbstractNotificationEvent<T> &
    (PushNotificationEvent | DbNotificationEvent | MailNotificationEvent | SmsNotificationEvent);

@Injectable()
export class NotificationEmitter {
    private readonly logger = new Logger(NotificationEmitter.name);

    constructor(private readonly moduleRef: ModuleRef) {}

    public async emit<T = any>(
        notificationClass: new (...args: any[]) => NotificationTypeClass<T>,
        data: T,
        triggeredBy?: Admin | User | Request['user'],
    ): Promise<void> {
        try {
            const notification = await this.moduleRef.resolve(notificationClass);
            notification.setData(data);

            // push
            if ((notification as PushNotificationEvent).toPush) {
                const { receiver, push, useBadge } = await (notification as PushNotificationEvent).toPush();
                receiver.setModuleRef(this.moduleRef);
                await (
                    (await this.moduleRef.resolve('PushNotificationManager')) as NotificationManagerInterface
                ).process(receiver, push, useBadge);
            }

            // database
            if ((notification as DbNotificationEvent).toDb) {
                await ((await this.moduleRef.resolve('DbNotificationManager')) as NotificationManagerInterface).process(
                    await (notification as DbNotificationEvent).toDb(),
                );
            }

            // mail
            if ((notification as MailNotificationEvent).toMail) {
                const { receiver, mail, mailer } = await (notification as MailNotificationEvent).toMail();
                receiver.setModuleRef(this.moduleRef);
                await (
                    (await this.moduleRef.resolve('MailNotificationManager')) as NotificationManagerInterface
                ).process(receiver, mail, mailer);
            }

            // sms
            if ((notification as SmsNotificationEvent).toSms) {
                const { receiver, sms } = await (notification as SmsNotificationEvent).toSms();
                receiver.setModuleRef(this.moduleRef);
                await (
                    (await this.moduleRef.resolve('SmsNotificationManager')) as NotificationManagerInterface
                ).process(receiver, sms);
            }

            // something else
        } catch (e) {
            this.logger.error(e.message, e.stack);
        }
    }
}
