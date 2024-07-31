import { AbstractEnum } from './abstract-enum';

export class AccessPermission extends AbstractEnum {
    public static readonly SOME_PERMISSION = 'some_permission';

    protected static choices: { [key: string]: any } = {
        [AccessPermission.SOME_PERMISSION]: 'Some Permission',
    };
}
