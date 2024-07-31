import { Body, Controller, HttpCode, HttpStatus, Post, Type, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { User, WebauthnDevice } from '@libs/orm';
import { ApiDescription, Mapper } from '@libs/core';
import { EntityManager } from '@mikro-orm/core';
import { WebauthnAuthenticationOutput } from '../dto/output/webauthn-authentication-output';
import { WebauthnAuthenticator } from '../service/webauthn-authenticator';
import { WebauthnAuthenticationInput } from '../dto/input/webauthn-authentication-input';
import { WebauthnExceptionFilter } from '../exception-filter/webauthn-exception-filter';

export const createWebauthnAuthenticationAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/webauthn/authentication')
    class WebauthnAuthenticationAction {
        constructor(
            private readonly em: EntityManager,
            private readonly mapper: Mapper,
            private readonly webauthnAuthenticator: WebauthnAuthenticator,
        ) {}

        @Post()
        @HttpCode(HttpStatus.OK)
        @UseGuards(...guards)
        @UseFilters(WebauthnExceptionFilter)
        @ApiDescription({
            summary: `Start authentication using WebAuthn standard`,
            roles: roles,
        })
        @ApiOkResponse({ type: WebauthnAuthenticationOutput })
        @ApiBadRequestResponse()
        async invoke(@Body() { user: userId }: WebauthnAuthenticationInput): Promise<any> {
            const user = await this.em.findOneOrFail(User, userId);
            const webauthnDevices = await this.em.find(WebauthnDevice, { user: user.id });
            const result = await this.webauthnAuthenticator.startAuthentication(user, webauthnDevices);

            return this.mapper.map(WebauthnAuthenticationOutput, result);
        }
    }

    return WebauthnAuthenticationAction;
};
