import { RedisService } from '@songkeys/nestjs-redis';
import { getClientIp } from 'request-ip';
import { Request } from 'express';
import { User } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';
import { UserInterface } from '../../contract/user-interface';
import { BruteForce } from './brute-force';
import { Injectable } from '@nestjs/common';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const RESET_PASSWORD_FORCE_BY_IP_DURATION = Number(process.env.RESET_PASSWORD_FORCE_BY_IP_DURATION || 60 * 60 * 1); // Store number of attempts for 1 hour since first fail
const RESET_PASSWORD_FORCE_BY_IP_MAX_WRONG_ATTEMPTS = Number(
    process.env.RESET_PASSWORD_FORCE_BY_IP_MAX_WRONG_ATTEMPTS || 5,
);

type Payload = { token: string };

@Injectable()
export class ResetPasswordBruteForce extends BruteForce<Payload> {
    static readonly IP_KEY_PREFIX = `${ResetPasswordBruteForce.name}_fail_consecutive_ip`;

    constructor(
        private readonly em: EntityManager,
        readonly redisService: RedisService,
    ) {
        const redis = redisService.getClient();
        const rateLimiters = [
            new RateLimiterRedis({
                storeClient: redis,
                keyPrefix: ResetPasswordBruteForce.IP_KEY_PREFIX,
                points: RESET_PASSWORD_FORCE_BY_IP_MAX_WRONG_ATTEMPTS,
                duration: RESET_PASSWORD_FORCE_BY_IP_DURATION,
            }),
        ];
        super(rateLimiters, [ResetPasswordBruteForce.IP_KEY_PREFIX]);
    }

    public async process<T extends UserInterface>(request: Request, payload: Payload): Promise<T | null> {
        const callback = () => {
            return this.em.findOne(User, { recoveryPasswordToken: payload.token });
        };

        return this.consume<any>(callback, request, payload);
    }

    protected getBruteForceKey(req: Request): string {
        return `${getClientIp(req)}-user-${getClientIp(req)}`;
    }
}
