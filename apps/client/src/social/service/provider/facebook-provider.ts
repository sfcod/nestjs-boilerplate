import { SocialProviderInterface } from './social-provider-interface';
import { Injectable } from '@nestjs/common';
import { UserFormattedData } from '../user-formatted-data';
import { UserSocialDataInput } from '../../dto/user-social-data-input';
import { UserSocialProvider } from '@libs/orm';
import { map } from 'rxjs/operators';
import crypto from 'crypto';
import { SocialDeleteData } from '../social-delete-data';
import { HttpService } from '@nestjs/axios';

interface ProfileInfo {
    id: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface ProviderInfo {
    provider: string;
}

interface SignedRequest {
    code: string;
    algorithm: string;
    issued_at: number;
    expires: number;
    user_id: string;
    oauth_token: string;
    app_data: string;
}

@Injectable()
export class FacebookProvider implements SocialProviderInterface {
    constructor(private readonly httpService: HttpService) {}

    getProvider = () => UserSocialProvider.PROVIDER_FACEBOOK;

    async verify(data: UserSocialDataInput): Promise<null | UserFormattedData> {
        const result = await this.fetch(data.token);

        if (result) {
            return this.formatData({ email: data.email, ...result, provider: data.provider });
        }

        return null;
    }

    private async fetch(accessToken: string): Promise<null | ProfileInfo> {
        try {
            const info = await this.httpService
                .get<ProfileInfo>(
                    `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,name,first_name,last_name`,
                )
                .pipe(map((response) => response))
                .toPromise();

            return info.data;
        } catch (e) {
            return null;
        }
    }

    parseDeletionRequest(signedData: any): SocialDeleteData {
        const secret = process.env.FACEBOOK_SECRET;

        const encodedData = signedData.signed_request.split('.', 2);

        // decode the data
        const sig = encodedData[0];
        const json = this.decode(encodedData[1]);
        const data: SignedRequest = JSON.parse(json);

        // check algorithm - not relevant to error
        if (!data.algorithm || data.algorithm.toUpperCase() != 'HMAC-SHA256') {
            throw new Error('Unknown algorithm. Expected HMAC-SHA256');
        }

        // check sig - not relevant to error
        const expected_sig = crypto
            .createHmac('sha256', secret)
            .update(encodedData[1])
            .digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace('=', '');
        if (sig !== expected_sig) {
            throw new Error('Bad signed JSON Signature!');
        }

        return {
            userId: data.user_id,
        };
    }

    private formatData = (data: ProfileInfo & ProviderInfo): UserFormattedData => {
        return {
            id: data.id,
            name: data.name ?? '',
            firstName: data.first_name ?? '',
            lastName: data.last_name ?? '',
            email: data.email,
            provider: data.provider,
        };
    };

    private decode(data: string, encoding = undefined) {
        encoding = encoding ?? 'utf8';
        const buf = new Buffer(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

        return buf.toString(encoding);
    }
}
