import { UserFormattedData } from '../user-formatted-data';
import { UserSocialDataInput } from '../../dto/user-social-data-input';
import { SocialDeleteData } from '../social-delete-data';

export interface SocialProviderInterface {
    getProvider: () => string;
    verify: (data: UserSocialDataInput) => Promise<null | UserFormattedData>;
    parseDeletionRequest: (data: any) => SocialDeleteData;
}
