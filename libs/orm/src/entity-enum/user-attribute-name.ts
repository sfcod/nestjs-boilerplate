import { AbstractEnum } from './abstract-enum';

export class UserAttributeName extends AbstractEnum {
    public static readonly TIMEZONE = 'timezone';

    protected static choices: { [key: string]: any } = {
        [UserAttributeName.TIMEZONE]: 'Timezone',
    };
}
