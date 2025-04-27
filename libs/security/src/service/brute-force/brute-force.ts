import { HttpException } from '@nestjs/common';
import { RateLimiterRes, RateLimiterStoreAbstract } from 'rate-limiter-flexible';
import { Request } from 'express';

export type Callback<T, P> = (opts: { limiters: RateLimiterStoreAbstract[]; payload?: P }) => Promise<T | null>;

export abstract class BruteForce<P extends Record<string, any>> {
    protected constructor(
        protected readonly rateLimiters: RateLimiterStoreAbstract[],
        protected readonly resetOnSuccess: string[] = [], // keys of limiters that should be reset after success consume
    ) {}

    protected async consume<T>(callback: Callback<T, P>, request: Request, payload?: P): Promise<T | null> {
        const brutes = await Promise.all(
            this.rateLimiters.map((limiter) => limiter.get(this.getBruteForceKey(request, limiter, payload))),
        );

        // if one of limiters is exceeded, we throw an error
        const exceededBruteCounter = brutes.find((brute) => brute?.remainingPoints <= 0);
        if (exceededBruteCounter) {
            this.populateHeaders(request, exceededBruteCounter);
            throw new HttpException('Too Many Requests', 429);
        }

        const res = await callback({ limiters: this.rateLimiters, payload });

        if (res) {
            // if the callback returns a result, we assume it's a success.
            // we need to reset the limiters that have resetOnSuccess option
            await Promise.all(this.resetOnSuccess.map((limiterPrefix) => this.reset(request, limiterPrefix, payload)));
            return res;
        }

        // consume all limiters
        const consumeResults = await Promise.all(
            this.rateLimiters.map((limiter) => limiter.consume(this.getBruteForceKey(request, limiter, payload))),
        );

        // find limiter with minimum remaining points
        const minimumConsumeResult = consumeResults.reduce((acc, cur) => {
            return cur.remainingPoints < acc.remainingPoints ? cur : acc;
        }, consumeResults[0]);

        // populate headers from the limiter with minimum remaining points
        minimumConsumeResult && this.populateHeaders(request, minimumConsumeResult);

        return null;
    }

    public async reset(req: Request, limiterPrefix: string, payload?: P) {
        const limiter = this.rateLimiters.find((l) => l.keyPrefix === limiterPrefix);
        return limiter?.delete(this.getBruteForceKey(req, limiter, payload));
    }

    protected abstract getBruteForceKey(req: Request, limiter: RateLimiterStoreAbstract, payload?: P): string;

    private populateHeaders(req: Request, rateLimiterRes: RateLimiterRes): RateLimiterRes {
        req.res.set('Retry-After', (rateLimiterRes.msBeforeNext / 1000).toString());
        req.res.set('X-RateLimit-Remaining', rateLimiterRes.remainingPoints.toString());
        req.res.set('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toUTCString());

        return rateLimiterRes;
    }
}
