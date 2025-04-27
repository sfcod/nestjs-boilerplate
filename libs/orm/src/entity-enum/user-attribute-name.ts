import { AbstractEnum } from './abstract-enum';

export class UserAttributeName extends AbstractEnum {
    public static readonly TIMEZONE = 'timezone';
    public static readonly RECOVERY_PASSWORD_EXPIRATION = 'recovery_password_expiration';

    protected static choices: { [key: string]: any } = {
        [UserAttributeName.TIMEZONE]: 'Timezone',
        [UserAttributeName.RECOVERY_PASSWORD_EXPIRATION]: 'Recovery Password Expiration',
    };
}
