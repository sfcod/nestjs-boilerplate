import { Body, Controller, Post, Request, Type, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User, Admin } from '@libs/orm';
import { plainToInstance } from 'class-transformer';
import { ApiDescription, createValidationError, validationHttpExceptionFactory } from '@libs/core';
import { CodeAuthenticator } from '../../service/code-authenticator';
import { SignerBuilder } from '../../service/signer-builder';
import { AuthTokenOutput } from '../../dto/auth-token-output';
import { VerifyCodeInput } from '../../dto/verify-code-input';
import { CodeAuthenticatorExceptionFilter } from '../../exception/code-authenticator-exception-filter';

export const createVerifyAuthCodeAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/verify-code')
    class VerifyAuthCodeAction {
        constructor(
            private readonly codeAuthenticator: CodeAuthenticator,
            private readonly signerBuilder: SignerBuilder,
        ) {}

        @UseGuards(...guards)
        @Post()
        @ApiOkResponse({ type: AuthTokenOutput })
        @ApiDescription({
            summary: 'Verify code for 2FA',
            roles: roles,
            description: endpointDescription,
        })
        @ApiUnauthorizedResponse()
        @ApiBearerAuth()
        @UseFilters(new CodeAuthenticatorExceptionFilter())
        async invoke(@Request() req, @Body() data: VerifyCodeInput) {
            const user: User | Admin = req.user;

            if (!(await this.codeAuthenticator.verify(data.code, user))) {
                throw validationHttpExceptionFactory([createValidationError(data, 'code', 'Invalid code')]);
            }

            const signer = await this.signerBuilder.getSigner();

            return plainToInstance<AuthTokenOutput, any>(AuthTokenOutput, await signer.sign(user));
        }
    }

    return VerifyAuthCodeAction;
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
<i>refreshToken</i> should be used to receive a new <i>token</i> after its expiration.<br/><br/>
</p>
<p>
There is such information encoded into the <i>token</i>:
<ul>
<li><i>roles</i>: list of assigned to user roles</li>
<li><i>symbol</i>: user's ID</li>
<li><i>pattern</i>: auth strategy</li>
<li><i>username</i>: user name</li>
<li><i>fullyAuthenticated</i>: describes if user is fully-authenticated. If it's <b>true</b> it means user has passed 2FA.
</li>
</ul> 
</p>
`;
