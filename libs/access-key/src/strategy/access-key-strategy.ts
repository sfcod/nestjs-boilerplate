import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { AccessKey } from '@libs/orm';
import { Request } from 'express';
import { AccessKeyManager } from '../service/access-key-manager';

@Injectable()
export class AccessKeyStrategy extends PassportStrategy(Strategy, 'api-access-key') {
    constructor(
        private readonly em: EntityManager,
        private readonly accessKeyManager: AccessKeyManager,
    ) {
        super();
    }

    async validate(req: Request): Promise<any> {
        if (!req.headers.hasOwnProperty('x-api-key') || !req.headers.hasOwnProperty('x-api-key-id')) {
            return false;
        }
        const key = await this.validateAccessKey(
            req.headers['x-api-key-id'] as string,
            req.headers['x-api-key'] as string,
        );

        if (!key) {
            throw new UnauthorizedException();
        }

        return key;
    }

    private async validateAccessKey(id: string, key: string): Promise<AccessKey | false> {
        try {
            const accessKey = await this.em.getRepository(AccessKey).findOne({ id: id }, { populate: ['permissions'] });
            if (accessKey && (await this.accessKeyManager.isValid(key, accessKey.key))) {
                return accessKey;
            }
        } catch (e) {
            return false;
        }
        return false;
    }
}
