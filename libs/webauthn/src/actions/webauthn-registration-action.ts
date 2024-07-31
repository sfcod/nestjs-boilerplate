import { Controller, Get, HttpCode, HttpStatus, Request, Type, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User, WebauthnDevice } from '@libs/orm';
import { ApiDescription, Mapper } from '@libs/core';
import { EntityManager } from '@mikro-orm/core';
import { WebauthnRegistrationOutput } from '../dto/output/webauthn-registration-output';
import { WebauthnAuthenticator } from '../service/webauthn-authenticator';
import { WebauthnVerifyRegistrationOutput } from '../dto/output/webauthn-verify-registration-output';
import { WebauthnExceptionFilter } from '../exception-filter/webauthn-exception-filter';

export const createWebauthnRegistrationAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/webauthn/registration')
    class WebauthnRegistrationAction {
        constructor(
            private readonly em: EntityManager,
            private readonly mapper: Mapper,
            private readonly webauthnAuthenticator: WebauthnAuthenticator,
        ) {}

        @Get()
        @HttpCode(HttpStatus.OK)
        @UseGuards(...guards)
        @UseFilters(WebauthnExceptionFilter)
        @ApiDescription({
            summary: `Register device using WebAuthn standard`,
            roles: roles,
        })
        @ApiUnauthorizedResponse()
        @ApiOkResponse({ type: WebauthnRegistrationOutput })
        @ApiBadRequestResponse({ type: WebauthnVerifyRegistrationOutput })
        async invoke(@Request() req: any): Promise<any> {
            const user: User = req.user;
            const webauthnDevices = await this.em.find(WebauthnDevice, { user: user.id });
            const result = await this.webauthnAuthenticator.startRegistration(user, webauthnDevices);

            return this.mapper.map(WebauthnRegistrationOutput, result);
        }
    }

    return WebauthnRegistrationAction;
};
