import { User } from '@libs/orm';
import { UserSocialDataInput } from '../dto/user-social-data-input';
import { SocialProviderInterface } from './provider/social-provider-interface';
import { SocialResolver } from './social-resolver';
import { SocialDataInputInterface } from '../dto/social-data-input-interface';

export interface SocialAuthInterface {
    auth: (socialData: UserSocialDataInput) => Promise<null | User>;
    delete: (provider: string, data: any) => Promise<string>;
    checkDelete: (provider: string, socialId: string) => Promise<boolean>;
}

export class SocialAuth implements SocialAuthInterface {
    resolvers: SocialProviderInterface[];

    constructor(private readonly resolver: SocialResolver) {}

    setResolvers = (resolvers) => {
        this.resolvers = resolvers;
    };

    async auth(socialData: UserSocialDataInput) {
        const provider = this.getProvider(socialData);

        const formattedData = await provider.verify(socialData);
        if (formattedData) {
            let user = await this.resolver.findUserByProvider(formattedData);
            if (!user) {
                user = await this.resolver.authUser(formattedData);
            }

            return user;
        }

        return null;
    }

    async delete(providerAlias: string, inputData: any): Promise<string> {
        const provider = this.getProvider({ provider: providerAlias });
        const data = provider.parseDeletionRequest(inputData);

        return await this.resolver.deleteSocialData(data);
    }

    async checkDelete(socialId: string): Promise<boolean> {
        return await this.resolver.checkDeleteSocialData(socialId);
    }

    protected getProvider = (socialData: SocialDataInputInterface): SocialProviderInterface => {
        const provider = this.resolvers.find(
            (provider: SocialProviderInterface) => provider.getProvider() === socialData.provider,
        );

        if (!provider) {
            throw new Error(`Provider "${socialData.provider}" is not registered.`);
        }

        return provider;
    };
}
