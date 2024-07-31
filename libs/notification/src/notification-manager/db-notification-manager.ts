import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Notification } from '@libs/orm';
import { NotificationManagerInterface } from '../contract/notification-manager.interface';

@Injectable()
export class DbNotificationManager implements NotificationManagerInterface {
    constructor(private readonly em: EntityManager) {}

    public async process(notification: Notification): Promise<void> {
        await this.em.persistAndFlush(notification);
    }
}
