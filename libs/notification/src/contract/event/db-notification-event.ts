import { Notification } from '@libs/orm';

export interface DbNotificationEvent {
    toDb(): Promise<Notification>;
}
