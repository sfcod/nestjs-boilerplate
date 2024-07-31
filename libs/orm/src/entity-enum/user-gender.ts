import { AbstractEnum } from './abstract-enum';

export class UserGender extends AbstractEnum {
    public static readonly MALE = 'male';
    public static readonly FEMALE = 'female';
    public static readonly OTHER = 'other';

    protected static choices: { [key: string]: any } = {
        [UserGender.MALE]: 'Male',
        [UserGender.FEMALE]: 'Female',
        [UserGender.OTHER]: 'Other',
    };
}
