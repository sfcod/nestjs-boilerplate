import { AbstractEnum } from './abstract-enum';

export class AdminStatus extends AbstractEnum {
    public static readonly STATUS_INACTIVE = 0;
    public static readonly STATUS_ACTIVE = 1;

    protected static choices: { [key: number]: any } = {
        [AdminStatus.STATUS_INACTIVE]: 'Inactive',
        [AdminStatus.STATUS_ACTIVE]: 'Active',
    };
}
