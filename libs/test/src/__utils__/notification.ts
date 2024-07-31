import { makeData } from './helpers';
import { makeUser } from './user';
import { Notification } from '@libs/orm';
import { NotificationStatus } from '@libs/orm';
import { NotificationType } from '@libs/orm';
import { faker } from '@faker-js/faker';

type AdditionalFields = Record<any, any>;

export async function makeNotification(
    count = 1,
    fields?: Partial<Notification> & Partial<AdditionalFields>,
): Promise<Notification | Notification[] | any> {
    const { user = await makeUser(1), ...rest } = fields || {};

    return await makeData<Notification>(count, rest, async () => {
        const notification = new Notification(user);
        notification.status = NotificationStatus.STATUS_UNREAD;
        notification.type = NotificationType.TYPE_WELCOME;
        (notification as any).title = faker.lorem.word();
        (notification as any).message = faker.lorem.words(5);

        return notification;
    });
}
