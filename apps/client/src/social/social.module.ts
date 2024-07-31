import { Module } from '@nestjs/common';
import { SocialAuth } from './service/social-auth';
import { FacebookProvider } from './service/provider/facebook-provider';
import { GoogleProvider } from './service/provider/google-provider';
import { SocialProviderInterface } from './service/provider/social-provider-interface';
import { SocialResolver } from './service/social-resolver';
import { AppleProvider } from './service/provider/apple-provider';
import { DeleteAction } from './actions/delete-action';
import { CheckDeleteAction } from './actions/check-delete-action';
import { SecurityModule } from '../security/security.module';
import { SocialAuthAction } from './actions/auth-action';
import { HttpModule } from '@nestjs/axios';

const socialAuth = {
    provide: SocialAuth,
    // useClass: SocialAuth,
    useFactory: (resolver: SocialResolver, ...providers: SocialProviderInterface[]) => {
        const socialAuth = new SocialAuth(resolver);
        socialAuth.setResolvers(providers);

        return socialAuth;
    },
    inject: [SocialResolver, FacebookProvider, GoogleProvider, AppleProvider],
};

@Module({
    imports: [SecurityModule, HttpModule],
    controllers: [SocialAuthAction, DeleteAction, CheckDeleteAction],
    providers: [SocialResolver, FacebookProvider, GoogleProvider, AppleProvider, socialAuth],
    exports: [socialAuth],
})
export class SocialModule {}
