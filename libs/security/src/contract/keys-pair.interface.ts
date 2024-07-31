import { UserInterface } from './user-interface';

export interface KeysPairInterface {
    generateKeysPair(user: UserInterface): { token: string; refreshToken: string };
}
