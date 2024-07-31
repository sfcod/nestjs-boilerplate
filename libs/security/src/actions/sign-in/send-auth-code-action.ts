import { Controller, HttpCode, HttpStatus, Post, Request, Type, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiNoContentResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiDescription } from '@libs/core';
import { CodeAuthenticator } from '../../service/code-authenticator';
import { CodeAuthenticatorExceptionFilter } from '../../exception/code-authenticator-exception-filter';
import { User2FAInterface } from '../../contract/user-2fa.interface';

export const createSendAuthCodeAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/send-code')
    class SendAuthCodeAction {
        constructor(private readonly codeAuthenticator: CodeAuthenticator) {}

        @UseGuards(...guards)
        @Post()
        @HttpCode(HttpStatus.NO_CONTENT)
        @ApiNoContentResponse()
        @ApiDescription({
            summary: 'Send code for 2FA',
            roles: roles,
            description: 'This endpoint should be used to trigger sending an auth code for 2FA.',
        })
        @ApiUnauthorizedResponse()
        @ApiBadRequestResponse()
        @ApiBearerAuth()
        @UseFilters(new CodeAuthenticatorExceptionFilter())
        async invoke(@Request() req) {
            const user: User2FAInterface = req.user;

            await this.codeAuthenticator.send(user, {
                throttleKey: 'sign-in-code',
            });
        }
    }

    return SendAuthCodeAction;
};
