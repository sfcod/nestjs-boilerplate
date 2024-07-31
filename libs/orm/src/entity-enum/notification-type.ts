import { AbstractEnum } from './abstract-enum';

export class NotificationType extends AbstractEnum {
    public static readonly TYPE_WELCOME = 1;
    public static readonly TYPE_SYSTEM = 100000;

    protected static choices: { [key: string]: any } = {
        [NotificationType.TYPE_WELCOME]: 'user_created',
        [NotificationType.TYPE_SYSTEM]: 'system',
    };
}
