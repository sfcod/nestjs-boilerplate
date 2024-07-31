import type { AuthenticatorTransportFuture, CredentialDeviceType } from '@simplewebauthn/types';

export interface WebauthnDeviceInterface {
    credentialId: string;
    credentialPublicKey: string;
    counter: number;
    credentialDeviceType: CredentialDeviceType;
    credentialBackedUp: boolean;
    transports: AuthenticatorTransportFuture[];
    aaguid?: string;
    lastUsedAt?: Date | string | null;
}
