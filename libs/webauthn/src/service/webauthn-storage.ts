import { WebauthnUserInterface } from '../contract/webauthn-user.interface';
import { RedisService } from '@songkeys/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { WebauthnStorageInterface } from '../contract/webauthn-storage.interface';

@Injectable()
export class WebauthnStorage implements WebauthnStorageInterface {
    constructor(private readonly redisService: RedisService) {}

    async storeChallenge(user: WebauthnUserInterface, challenge: string): Promise<void> {
        await this.redisService.getClient().set(this.getKey(user), challenge, 'PX', 60000);
    }

    async fetchChallenge(user: WebauthnUserInterface): Promise<string> {
        return this.redisService.getClient().get(this.getKey(user));
    }

    async deleteChallenge(user: WebauthnUserInterface): Promise<number> {
        return this.redisService.getClient().del(this.getKey(user));
    }

    private getKey(user: WebauthnUserInterface): string {
        return `webauthn-${user.getUuid()}`;
    }
}
