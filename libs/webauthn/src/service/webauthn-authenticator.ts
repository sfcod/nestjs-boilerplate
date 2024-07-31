import {
    generateAuthenticationOptions,
    generateRegistrationOptions,
    verifyAuthenticationResponse,
    verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { isoBase64URL, isoUint8Array } from '@simplewebauthn/server/helpers';

import { WebauthnUserInterface } from '../contract/webauthn-user.interface';
import { WebauthnDeviceInterface } from '../contract/webauthn-device.interface';
import { Injectable } from '@nestjs/common';
import { WebauthnException } from '../exception/webauthn-exception';
import { AuthenticationResponseJSON, RegistrationResponseJSON } from '@simplewebauthn/types';
import { WebauthnStorageInterface } from '../contract/webauthn-storage.interface';

export type WebauthnConfig = {
    rpName: string;
    rpId: string;
    origin: string;
};

@Injectable()
export class WebauthnAuthenticator {
    constructor(
        private readonly config: WebauthnConfig,
        private readonly storage: WebauthnStorageInterface,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async startRegistration(user: WebauthnUserInterface, existingDevices: WebauthnDeviceInterface[] = []) {
        const result = await generateRegistrationOptions({
            rpName: this.config.rpName,
            rpID: this.config.rpId,
            userID: user.getUuid(),
            userName: user.getUsername(),
            userDisplayName: user.getUsername(),
            // Don't prompt users for additional information about the authenticator (Recommended for smoother UX)
            attestationType: 'none',
            // Prevent users from re-registering existing authenticators
            // We omit this to handle issue when user deletes credentials from device
            // excludeCredentials: existingDevices.map((item) => ({
            //     id: isoBase64URL.toBuffer(item.credentialId),
            //     type: 'public-key',
            //     transports: item.transports,
            // })),
            // See "Guiding use of authenticators via authenticatorSelection" below
            authenticatorSelection: {
                // Defaults
                residentKey: 'preferred',
                userVerification: 'preferred',
                // Optional
                authenticatorAttachment: 'platform',
            },
        });

        await this.storage.storeChallenge(user, result.challenge);

        return result;
    }

    async verifyRegistration(
        user: WebauthnUserInterface,
        payload: RegistrationResponseJSON,
    ): Promise<{ verified: boolean; device: WebauthnDeviceInterface }> {
        try {
            const expectedChallenge = await this.storage.fetchChallenge(user);
            const verification = await verifyRegistrationResponse({
                response: payload,
                expectedChallenge,
                expectedOrigin: this.config.origin,
                expectedRPID: this.config.rpId,
            });

            if (!verification.verified) {
                throw new WebauthnException('Registration verification failed');
            }

            await this.storage.deleteChallenge(user);

            return {
                verified: true,
                device: {
                    credentialId: isoBase64URL.fromBuffer(verification.registrationInfo.credentialID),
                    credentialBackedUp: verification.registrationInfo.credentialBackedUp,
                    credentialDeviceType: verification.registrationInfo.credentialDeviceType,
                    credentialPublicKey: isoBase64URL.fromBuffer(verification.registrationInfo.credentialPublicKey),
                    counter: verification.registrationInfo.counter,
                    transports: payload.response.transports,
                    aaguid: verification.registrationInfo.aaguid,
                },
            };
        } catch (error) {
            throw new WebauthnException(error.message, error);
        }
    }

    async startAuthentication(user: WebauthnUserInterface, existingDevices: WebauthnDeviceInterface[]) {
        const result = await generateAuthenticationOptions({
            rpID: this.config.rpId,
            // Require users to use a previously-registered authenticator
            allowCredentials: existingDevices.map((item) => ({
                id: isoBase64URL.toBuffer(item.credentialId),
                type: 'public-key',
                transports: item.transports,
            })),
            userVerification: 'preferred',
        });

        await this.storage.storeChallenge(user, result.challenge);

        return result;
    }

    async verifyAuthentication(
        user: WebauthnUserInterface,
        payload: AuthenticationResponseJSON,
        devices: WebauthnDeviceInterface[],
    ): Promise<{ verified: boolean; device: WebauthnDeviceInterface }> {
        try {
            const credentialId = isoBase64URL.toBuffer(payload.rawId);
            const device = devices.find((item) =>
                isoUint8Array.areEqual(isoBase64URL.toBuffer(item.credentialId), credentialId),
            );

            if (!device) {
                throw new WebauthnException('Device is not registered');
            }

            const expectedChallenge = await this.storage.fetchChallenge(user);
            const verification = await verifyAuthenticationResponse({
                response: payload,
                expectedChallenge,
                expectedOrigin: this.config.origin,
                expectedRPID: this.config.rpId,
                authenticator: {
                    transports: device.transports,
                    counter: device.counter,
                    credentialPublicKey: isoBase64URL.toBuffer(device.credentialPublicKey),
                    credentialID: isoBase64URL.toBuffer(device.credentialId),
                },
            });

            if (!verification.verified) {
                throw new WebauthnException('Authentication verification failed');
            }

            await this.storage.deleteChallenge(user);

            return {
                verified: true,
                device: {
                    credentialId: isoBase64URL.fromBuffer(verification.authenticationInfo.credentialID),
                    credentialBackedUp: verification.authenticationInfo.credentialBackedUp,
                    credentialDeviceType: verification.authenticationInfo.credentialDeviceType,
                    credentialPublicKey: device.credentialPublicKey,
                    counter: verification.authenticationInfo.newCounter,
                    transports: device.transports,
                },
            };
        } catch (error) {
            throw new WebauthnException(error.message, error);
        }
    }
}
