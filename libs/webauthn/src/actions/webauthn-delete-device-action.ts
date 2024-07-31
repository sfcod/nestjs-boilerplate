import { Controller, Delete, HttpCode, HttpStatus, Param, Type, UseFilters, UseGuards } from '@nestjs/common';
import { ApiNoContentResponse, ApiNotFoundResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { WebauthnDevice } from '@libs/orm';
import { ApiDescription, Mapper, uuid } from '@libs/core';
import { EntityManager } from '@mikro-orm/core';
import { WebauthnAuthenticator } from '../service/webauthn-authenticator';
import { WebauthnExceptionFilter } from '../exception-filter/webauthn-exception-filter';

export const createWebauthnDeleteDeviceAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || `auths/webauthn/device/${uuid('id')}`)
    class WebauthnDeleteDeviceAction {
        constructor(
            private readonly em: EntityManager,
            private readonly mapper: Mapper,
            private readonly webauthnAuthenticator: WebauthnAuthenticator,
        ) {}

        @Delete()
        @HttpCode(HttpStatus.NO_CONTENT)
        @UseGuards(...guards)
        @UseFilters(WebauthnExceptionFilter)
        @ApiDescription({
            summary: `Delete WebAuthn device`,
            roles: roles,
        })
        @ApiUnauthorizedResponse()
        @ApiNoContentResponse()
        @ApiNotFoundResponse()
        async invoke(@Param('id') id: string): Promise<any> {
            const webauthnDevices = await this.em.findOneOrFail(WebauthnDevice, id);
            await this.em.removeAndFlush(webauthnDevices);
        }
    }

    return WebauthnDeleteDeviceAction;
};
