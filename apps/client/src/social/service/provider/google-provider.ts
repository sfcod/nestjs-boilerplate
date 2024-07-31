import { SocialProviderInterface } from './social-provider-interface';
import { Injectable } from '@nestjs/common';
import { UserFormattedData } from '../user-formatted-data';
import { UserSocialDataInput } from '../../dto/user-social-data-input';
import { map } from 'rxjs/operators';
import { UserSocialProvider } from '@libs/orm';
import { SocialDeleteData } from '../social-delete-data';
import { HttpService } from '@nestjs/axios';

interface ProfileInfo {
    id: string;
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}

interface ProviderInfo {
    provider: string;
}

@Injectable()
export class GoogleProvider implements SocialProviderInterface {
    constructor(private readonly httpService: HttpService) {}

    getProvider(): string {
        return UserSocialProvider.PROVIDER_GOOGLE;
    }

    async verify(data: UserSocialDataInput): Promise<null | UserFormattedData> {
        const result = await this.fetch(data.token);

        if (result) {
            return this.formatData({ ...result, provider: data.provider });
        }

        return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    parseDeletionRequest(data: any): SocialDeleteData {
        throw new Error('Action is not supported');
    }

    private async fetch(accessToken: string): Promise<null | ProfileInfo> {
        try {
            const info = await this.httpService
                .get<ProfileInfo>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accessToken}`)
                .pipe(map((response) => response.data))
                .toPromise();

            return info;
        } catch (e) {
            return null;
        }
    }

    private formatData(data: ProfileInfo & ProviderInfo): UserFormattedData {
        return {
            id: data.id,
            name: data.name,
            firstName: data.given_name,
            lastName: data.family_name,
            email: data.email,
            provider: data.provider,
        };
    }
}
