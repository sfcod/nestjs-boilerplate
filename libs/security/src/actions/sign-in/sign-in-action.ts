import { Body, Controller, Post, Request, Type, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Admin, User } from '@libs/orm';
import { ApiDescription } from '@libs/core';
import { SignerBuilder } from '../../service/signer-builder';
import { AuthTokenOutput } from '../../dto/auth-token-output';
import { AuthDataInput } from '../../dto/auth-data-input';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SignInEvent } from '../../event/sign-in.event';

export const createSignInAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/sign-in')
    class SignInAction {
        constructor(
            private readonly signerBuilder: SignerBuilder,
            private readonly eventEmitter: EventEmitter2,
        ) {}

        @Post()
        @UseGuards(...guards)
        @ApiDescription({ summary: `Get JWT token`, roles: roles, description: endpointDescription })
        @ApiOkResponse({ type: AuthTokenOutput })
        @ApiUnauthorizedResponse()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async invoke(@Request() req, @Body() authToken: AuthDataInput): Promise<any> {
            const user: Admin | User = req.user;
            const signer = user.twoFactorAuth
                ? await this.signerBuilder.getGuestSigner()
                : await this.signerBuilder.getSigner();

            await this.eventEmitter.emitAsync(SignInEvent.eventName, new SignInEvent(user, req));

            return plainToInstance(AuthTokenOutput, await signer.sign(req.user));
        }
    }

    return SignInAction;
};

const endpointDescription = `
<p>
To have access to API endpoints user has to be authorised with <i>token</i>.<br/>
User gets <i>token</i> after successful sign in and after passing 2FA.
</p>
<p>
Successful response:<br/>
<i>{<br/>
  "token": "string",<br/>
  "refreshToken": "string"<br/>
}</i>.
</p>
<p>
Because of 2FA it will be <b>null</b> as a value for <i>refreshToken</i>: <br/>
<i>{<br/>
  "token": "string",<br/>
  "refreshToken": null<br/>
}</i>.
</p>
<p>
<i>refreshToken</i> should be used to receive a new <i>token</i> after its expiration.<br/><br/>
</p>
<p>
There is such information encoded into the <i>token</i>:
<ul>
<li><i>roles</i>: list of assigned to user roles</li>
<li><i>symbol</i>: user's ID</li>
<li><i>pattern</i>: auth strategy</li>
<li><i>username</i>: user name</li>
<li><i>fullyAuthenticated</i>: describes if user is fully-authenticated. If it's <b>false</b> then user should pass 2FA.
 Before doing that user will have access only to a limited number of endpoints.
</li>
</ul> 
</p>
`;
