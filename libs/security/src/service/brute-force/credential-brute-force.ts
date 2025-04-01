import { HttpException, Inject, Injectable, Scope } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { RedisService } from '@songkeys/nestjs-redis';
import { Request } from 'express';
import { getClientIp } from 'request-ip';
import { REQUEST } from '@nestjs/core';
import { Admin, User } from '@libs/orm';
import { EntityManager, raw } from '@mikro-orm/core';
import { UserInterface } from '../../contract/user-interface';
import { PasswordHash } from '../password-hash';

const USER_BRUTE_FORCE_BY_IP_DURATION = Number(process.env.USER_BRUTE_FORCE_BY_IP_DURATION || 60 * 60 * 24); // Store number for 1 day since first fail
const USER_BRUTE_FORCE_BY_IP_BLOCK_DURATION = Number(process.env.USER_BRUTE_FORCE_BY_IP_BLOCK_DURATION || 60 * 60 * 24); // Block for 1 day, if 100 wrong attempts per day;
const USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS = Number(process.env.USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS || 100);

const USER_BRUTE_FORCE_BY_USERNAME_AND_IP_DURATION = Number(
    process.env.USER_BRUTE_FORCE_BY_USERNAME_AND_IP_DURATION || 60 * 60 * 24 * 90,
); // Store number for 90 days since first fail
const USER_BRUTE_FORCE_BY_USERNAME_AND_IP_BLOCK_DURATION = Number(
    process.env.USER_BRUTE_FORCE_BY_USERNAME_AND_IP_BLOCK_DURATION || 60 * 60,
); // Block for 1 hour
const USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS = Number(
    process.env.USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS || 5,
);

@Injectable({ scope: Scope.REQUEST })
export class CredentialBruteForce {
    private bruteByIP: RateLimiterRedis;
    private bruteByUsernameAndIP: RateLimiterRedis;

    constructor(
        private readonly em: EntityManager,
        private readonly redisService: RedisService,
        private readonly passwordHash: PasswordHash,
        @Inject(REQUEST) private readonly req: Request,
    ) {
        const redis = this.redisService.getClient();

        this.bruteByIP = new RateLimiterRedis({
            storeClient: redis,
            keyPrefix: `${CredentialBruteForce.name}_fail_consecutive_ip`,
            points: USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS,
            duration: USER_BRUTE_FORCE_BY_IP_DURATION,
            blockDuration: USER_BRUTE_FORCE_BY_IP_BLOCK_DURATION,
        });
        this.bruteByUsernameAndIP = new RateLimiterRedis({
            storeClient: redis,
            keyPrefix: `${CredentialBruteForce.name}_fail_consecutive_username_and_ip`,
            points: USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS,
            duration: USER_BRUTE_FORCE_BY_USERNAME_AND_IP_DURATION, // Store number for 90 days since first fail
            blockDuration: USER_BRUTE_FORCE_BY_USERNAME_AND_IP_BLOCK_DURATION, // Block for 1 hour
        });
    }

    public async process<T extends UserInterface = any>(
        pattern: ('admin' | 'user')[],
        username: string,
        password: string,
    ): Promise<T | null> {
        const [bruteByIP, bruteByUsernameAndIP] = await Promise.all([
            this.bruteByIP.get(this.getBruteForceKeyByIP(pattern.join('-'))),
            this.bruteByUsernameAndIP.get(this.getBruteForceKeyByNameAndIP(pattern.join('-'), username)),
        ]);

        let retrySecs = 0;
        // Check if IP or Username + IP is already blocked
        if (bruteByIP && bruteByIP.consumedPoints > USER_BRUTE_FORCE_BY_IP_MAX_WRONG_ATTEMPTS) {
            retrySecs = Math.round(bruteByIP.msBeforeNext / 1000) || 1;
        } else if (
            bruteByUsernameAndIP &&
            bruteByUsernameAndIP.consumedPoints >= USER_BRUTE_FORCE_BY_USERNAME_AND_IP_MAX_WRONG_ATTEMPTS
        ) {
            retrySecs = Math.round(bruteByUsernameAndIP.msBeforeNext / 1000) || 1;
        }
        if (retrySecs > 0) {
            // res.set('Retry-After', String(retrySecs));
            // res.status(429).send('Too Many Requests');

            throw new HttpException('Too Many Requests', 429);
        }
        for (const p of pattern) {
            const user = await this.findUser(p, username);
            if (user && (await this.passwordHash.compare(password, user.getPassword()))) {
                return user as T;
            }
        }
        await this.bruteByIP.consume(this.getBruteForceKeyByIP(pattern.join('-')));
        await this.bruteByUsernameAndIP.consume(this.getBruteForceKeyByNameAndIP(pattern.join('-'), username));

        return null;
    }

    private async findUser(pattern: string, username: string): Promise<UserInterface | null> {
        switch (pattern) {
            case 'admin':
                return await this.em.findOne(Admin, { [raw('lower(email)')]: username.toLowerCase() } as any);
            case 'user':
                return await this.em.findOne(User, {
                    [raw('lower(email)')]: username.toLowerCase(),
                    deletedAt: { $eq: null },
                } as any);
        }
    }

    private getBruteForceKeyByIP(pattern: string): string {
        return `${getClientIp(this.req)}-${pattern}-${getClientIp(this.req)}`;
    }

    private getBruteForceKeyByNameAndIP(pattern: string, username: string): string {
        return `${this.getBruteForceKeyByIP(pattern)}-${username}-${getClientIp(this.req)}`;
    }
}
