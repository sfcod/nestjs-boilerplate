import { AbstractEnum } from './abstract-enum';

export class UserSocialProvider extends AbstractEnum {
    public static readonly PROVIDER_FACEBOOK = 'facebook';
    public static readonly PROVIDER_GOOGLE = 'google';
    public static readonly PROVIDER_APPLE = 'apple';

    protected static choices: { [key: string]: any } = {
        [UserSocialProvider.PROVIDER_FACEBOOK]: 'Facebook',
        [UserSocialProvider.PROVIDER_GOOGLE]: 'Google',
        [UserSocialProvider.PROVIDER_APPLE]: 'Apple',
    };
}
