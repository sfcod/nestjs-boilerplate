import { Body, Controller, HttpCode, HttpStatus, Post, Req, Type, UseFilters, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { getCurrentTimestamp, User, UserStatus, WebauthnDevice } from '@libs/orm';
import { ApiDescription } from '@libs/core';
import { EntityManager, wrap } from '@mikro-orm/core';
import { WebauthnAuthenticator } from '../service/webauthn-authenticator';
import { WebauthnDeviceInterface } from '../contract/webauthn-device.interface';
import { WebauthnVerifyAuthenticationInput } from '../dto/input/webauthn-verify-authentication-input';
import { WebauthnExceptionFilter } from '../exception-filter/webauthn-exception-filter';
import { AuthTokenOutput, SignerBuilder, SignInEvent } from '@libs/security';
import { plainToInstance } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const createWebauthnAuthenticationVerifyAction = ({
    route,
    roles,
    guards,
}: {
    route: string;
    roles: string[];
    guards: any[];
}): Type<any> => {
    @ApiTags('Auth')
    @Controller(route || 'auths/webauthn/authentication/verify')
    class WebauthnAuthenticationVerifyAction {
        constructor(
            private readonly em: EntityManager,
            private readonly signerBuilder: SignerBuilder,
            private readonly eventEmitter: EventEmitter2,
            private readonly webauthnAuthenticator: WebauthnAuthenticator,
        ) {}

        @Post()
        @HttpCode(HttpStatus.OK)
        @UseGuards(...guards)
        @UseFilters(WebauthnExceptionFilter)
        @ApiDescription({
            summary: `Verify authentication using WebAuthn standard`,
            roles: roles,
        })
        @ApiOkResponse({ type: AuthTokenOutput })
        @ApiBadRequestResponse()
        async invoke(
            @Req() req: any,
            @Body() { user: userId, payload }: WebauthnVerifyAuthenticationInput,
        ): Promise<any> {
            const user = await this.em.findOneOrFail(User, userId);
            const devices = await this.em.find(WebauthnDevice, { user: user.id });

            const { device } = await this.webauthnAuthenticator.verifyAuthentication(user, payload, devices);
            await this.saveWebauthnDevice(user, device);

            const signer =
                user.status === UserStatus.STATUS_ACTIVE
                    ? await this.signerBuilder.getSigner()
                    : await this.signerBuilder.getGuestSigner();
            await this.eventEmitter.emitAsync(SignInEvent.eventName, new SignInEvent(user, req));

            return plainToInstance(AuthTokenOutput, await signer.sign(user));
        }

        private async saveWebauthnDevice(user: User, deviceData: WebauthnDeviceInterface) {
            const webauthnDevice = await this.em.findOne(WebauthnDevice, {
                credentialId: deviceData.credentialId,
            });
            wrap(webauthnDevice).assign(deviceData, { em: this.em });
            webauthnDevice.lastUsedAt = getCurrentTimestamp();

            await this.em.persistAndFlush(webauthnDevice);
        }
    }

    return WebauthnAuthenticationVerifyAction;
};
