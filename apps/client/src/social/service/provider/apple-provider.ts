import { SocialProviderInterface } from './social-provider-interface';
import { UserFormattedData } from '../user-formatted-data';
import { UserSocialDataInput } from '../../dto/user-social-data-input';
import { map } from 'rxjs/operators';
import { UserSocialProvider } from '@libs/orm';
import { JWK, JWS } from 'node-jose';
import { SocialDeleteData } from '../social-delete-data';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

interface TokenPayload {
    iss: string;
    aud: string;
    exp: number;
    iat: number;
    sub: string;
    c_hash: string;
    email: string;
    email_verified: 'true' | 'false';
    is_private_email: 'true' | 'false';
    auth_time: number;
    nonce_supported: boolean;
}

interface ProviderInfo {
    provider: string;
}

@Injectable()
export class AppleProvider implements SocialProviderInterface {
    constructor(private readonly httpService: HttpService) {}

    getProvider(): string {
        return UserSocialProvider.PROVIDER_APPLE;
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

    private async fetch(identityToken: string): Promise<null | TokenPayload> {
        try {
            const body = await this.httpService
                .get('https://appleid.apple.com/auth/keys')
                .pipe(map((response) => response.data))
                .toPromise();

            const key = await JWK.asKeyStore(body);
            const verifier = JWS.createVerify(key);
            const result = await verifier.verify(identityToken);

            return JSON.parse(result.payload.toString());
        } catch (e) {
            return null;
        }
    }

    private formatData(data: TokenPayload & ProviderInfo): UserFormattedData {
        return {
            id: data.sub,
            name: '',
            email: data.email,
            provider: data.provider,
        };
    }
}
