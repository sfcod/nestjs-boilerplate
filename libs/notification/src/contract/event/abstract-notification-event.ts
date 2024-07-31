import { NotificationEvent } from './notification-event';

export abstract class AbstractNotificationEvent<T = any> implements NotificationEvent {
    private data: T;

    abstract getType();

    public setData(data: T): void {
        this.data = data;
    }

    public getData(): T {
        return this.data;
    }
}
