import { AbstractEnum } from './abstract-enum';

export class AdminRole extends AbstractEnum {
    public static readonly ROLE_SYSTEM_ADMIN = 'ROLE_SYSTEM_ADMIN';

    protected static choices: { [key: string]: any } = {
        [AdminRole.ROLE_SYSTEM_ADMIN]: 'Admin',
    };
}
