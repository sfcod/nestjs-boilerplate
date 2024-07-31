import { AbstractEnum } from './abstract-enum';

export class UserRole extends AbstractEnum {
    public static readonly ROLE_USER = 'ROLE_USER';

    protected static choices: { [key: string]: any } = {
        [UserRole.ROLE_USER]: 'User',
    };
}
