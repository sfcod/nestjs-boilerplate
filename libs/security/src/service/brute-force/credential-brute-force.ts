import { Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from '@songkeys/nestjs-redis';
import { getClientIp } from 'request-ip';
import { Request } from 'express';
import { EntityManager, raw } from '@mikro-orm/core';
import { UserInterface } from '../../contract/user-interface';
import { PasswordHash } from '../password-hash';
import { BruteForce } from './brute-force';
import { Admin, User } from '@libs/orm';

const USER_BRUTE_FORCE_BY_IP_DURATION = Number(process.env.USER_BRUTE_FORCE_BY_IP_DURATION || 60 * 60 * 24); // Store number of attempts for 24 hours since first fail
const USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS = Number(process.env.USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS || 100);

const USER_BRUTE_FORCE_BY_USERNAME_AND_IP_DURATION = Number(
    process.env.USER_BRUTE_FORCE_BY_USERNAME_AND_IP_DURATION || 60 * 60,
);
// Store number of attempts for 1 hour since first fail
const USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS = Number(
    process.env.USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS || 5,
);

type Payload = { username: string; password?: string; pattern: ('admin' | 'user')[] };

@Injectable()
export class CredentialBruteForce extends BruteForce<Payload> {
    static readonly IP_KEY_PREFIX = `${CredentialBruteForce.name}_fail_consecutive_ip`;
    static readonly USERNAME_AND_IP_KEY_PREFIX = `${CredentialBruteForce.name}_fail_consecutive_username_and_ip`;

    constructor(
        private readonly em: EntityManager,
        private readonly passwordHash: PasswordHash,
        readonly redisService: RedisService,
    ) {
        const redis = redisService.getClient();
        const rateLimiters = [
            new RateLimiterRedis({
                storeClient: redis,
                keyPrefix: CredentialBruteForce.IP_KEY_PREFIX,
                points: USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS,
                duration: USER_BRUTE_FORCE_BY_IP_DURATION,
            }),
            new RateLimiterRedis({
                storeClient: redis,
                keyPrefix: CredentialBruteForce.USERNAME_AND_IP_KEY_PREFIX,
                points: USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS,
                duration: USER_BRUTE_FORCE_BY_USERNAME_AND_IP_DURATION,
            }),
        ];

        super(rateLimiters, [CredentialBruteForce.USERNAME_AND_IP_KEY_PREFIX]);
    }

    public async process<T extends UserInterface>(request: Request, payload: Payload): Promise<T | null> {
        const callback = async () => {
            for (const p of payload.pattern) {
                const user = await this.findUser<T>(p, payload.username);
                if (user && (await this.passwordHash.compare(payload.password, user.getPassword()))) {
                    return user;
                }
            }
        };

        return this.consume<T>(callback, request, payload);
    }

    protected async findUser<T>(pattern: string, username: string): Promise<T | null> {
        switch (pattern) {
            case 'admin':
                return (await this.em.findOne(Admin, { [raw('lower(email)')]: username.toLowerCase() } as any)) as T;
            case 'user':
                return (await this.em.findOne(User, {
                    [raw('lower(email)')]: username.toLowerCase(),
                    deletedAt: { $eq: null },
                } as any)) as T;
        }
    }

    protected getBruteForceKey(req: Request, limiter: RateLimiterRedis, payload?: Payload): string {
        switch (limiter.keyPrefix) {
            case CredentialBruteForce.USERNAME_AND_IP_KEY_PREFIX:
                return this.getBruteForceKeyByNameAndIP(req, payload);
            case CredentialBruteForce.IP_KEY_PREFIX:
            default:
                return this.getBruteForceKeyByIP(req, payload);
        }
    }

    private getBruteForceKeyByIP(req: Request, payload: Payload): string {
        const pattern = payload.pattern.join('-');
        return `${getClientIp(req)}-${pattern}-${getClientIp(req)}`;
    }

    private getBruteForceKeyByNameAndIP(req: Request, payload: Payload): string {
        return `${this.getBruteForceKeyByIP(req, payload)}-${payload.username}-${getClientIp(req)}`;
    }
}
