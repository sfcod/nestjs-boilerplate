export type AuthenticatorType = 'sms' | 'email';

export interface User2FAInterface {
    getAuthenticatorType(): AuthenticatorType;

    getAuthenticatorIdentity(): string | null;

    getUuid(): string;
}
