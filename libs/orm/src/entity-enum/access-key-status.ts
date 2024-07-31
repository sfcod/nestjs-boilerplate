import { AbstractEnum } from './abstract-enum';

export class AccessKeyStatus extends AbstractEnum {
    public static readonly STATUS_ACTIVE = 1;
    public static readonly STATUS_INACTIVE = 0;

    protected static choices: { [key: string]: any } = {
        [AccessKeyStatus.STATUS_ACTIVE]: 'Active',
        [AccessKeyStatus.STATUS_INACTIVE]: 'Inactive',
    };
}
