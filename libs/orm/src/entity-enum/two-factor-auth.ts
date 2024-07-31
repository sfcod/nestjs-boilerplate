import { AbstractEnum } from './abstract-enum';

export class TwoFactorAuth extends AbstractEnum {
    public static readonly SMS = 'sms';
    public static readonly EMAIL = 'email';

    protected static choices: { [key: string]: any } = {
        [TwoFactorAuth.SMS]: 'Sms',
        [TwoFactorAuth.EMAIL]: 'Email',
    };
}
