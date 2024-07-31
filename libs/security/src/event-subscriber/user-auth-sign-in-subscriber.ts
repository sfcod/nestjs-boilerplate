import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { CodeAuthenticator } from '../service/code-authenticator';
import { UserAuthSignInEvent } from '../event/user-auth-sign-in.event';

@Injectable()
export class UserAuthSignInSubscriber {
    constructor(private readonly codeAuthenticator: CodeAuthenticator) {}

    @OnEvent(UserAuthSignInEvent.eventName, { async: true, promisify: true, suppressErrors: false })
    async invoke({ user }: UserAuthSignInEvent) {
        await this.codeAuthenticator.reset(user, ['send', 'verify']);
        await this.codeAuthenticator.reset(user, ['send', 'verify'], 'sign-in-code');
    }
}
