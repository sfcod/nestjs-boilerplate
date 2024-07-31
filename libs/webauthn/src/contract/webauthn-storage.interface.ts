import { WebauthnUserInterface } from './webauthn-user.interface';

export interface WebauthnStorageInterface {
    storeChallenge(user: WebauthnUserInterface, challenge: string): Promise<void>;
    fetchChallenge(user: WebauthnUserInterface): Promise<string>;
    deleteChallenge(user: WebauthnUserInterface): Promise<number>;
}
