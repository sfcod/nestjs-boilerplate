import { AbstractEnum } from './abstract-enum';

export class NotificationStatus extends AbstractEnum {
    public static readonly STATUS_UNREAD = 0;
    public static readonly STATUS_READ = 1;

    protected static choices: { [key: string]: any } = {
        [NotificationStatus.STATUS_UNREAD]: 'Unread',
        [NotificationStatus.STATUS_READ]: 'Read',
    };
}
