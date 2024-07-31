import { Body, Controller, HttpCode, HttpStatus, Post, Request, Type, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { User, WebauthnDevice } from '@libs/orm';
import { ApiDescription, Mapper } from '@libs/core';
import { EntityManager, wrap } from '@mikro-orm/core';
import { WebauthnAuthenticator } from '../service/webauthn-authenticator';
import { WebauthnVerifyRegistrationOutput } from '../dto/output/webauthn-verify-registration-output';
import { WebauthnDeviceInterface } from '../contract/webauthn-device.interface';
import { WebauthnVerifyRegistrationInput } from '../dto/input/webauthn-verify-registration-input';
import { WebauthnExceptionFilter } from '../exception-filter/webauthn-exception-filter';

export const createWebauthnRegistrationVerifyAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/webauthn/registration/verify')
    class WebauthnRegistrationVerifyAction {
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
            summary: `Verify registered device using WebAuthn standard`,
            roles: roles,
        })
        @ApiUnauthorizedResponse()
        @ApiOkResponse({ type: WebauthnVerifyRegistrationOutput })
        @ApiBadRequestResponse({ type: WebauthnVerifyRegistrationOutput })
        async invoke(@Request() req: any, @Body() { payload }: WebauthnVerifyRegistrationInput): Promise<any> {
            const user: User = req.user;

            const { device } = await this.webauthnAuthenticator.verifyRegistration(user, payload);
            const webauthnDevice = await this.saveWebauthnDevice(user, device);

            return this.mapper.map(WebauthnVerifyRegistrationOutput, {
                status: 'success',
                message: 'Device registered successfully',
                device: webauthnDevice.id,
            });
        }

        private async saveWebauthnDevice(user: User, deviceData: WebauthnDeviceInterface) {
            const existingDevice = await this.em.findOne(WebauthnDevice, {
                credentialId: deviceData.credentialId,
            });

            if (existingDevice) return;

            const webauthnDevice = new WebauthnDevice(user);
            wrap(webauthnDevice).assign(deviceData, { em: this.em });

            await this.em.persistAndFlush(webauthnDevice);

            return webauthnDevice;
        }
    }

    return WebauthnRegistrationVerifyAction;
};
