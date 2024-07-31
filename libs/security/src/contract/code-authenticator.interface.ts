import { User2FAInterface } from './user-2fa.interface';

export interface CodeAuthenticatorInterface {
    generate: (user: User2FAInterface) => Promise<string>;
    verify: (code: string, user: User2FAInterface) => Promise<boolean>;
    send: (user: User2FAInterface, params?: Record<string, any>) => Promise<void>;
    reset: (user: User2FAInterface) => Promise<void>;
}
