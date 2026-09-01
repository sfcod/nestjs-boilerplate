import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { isUUID } from 'class-validator';

const UUID_PARAM_PREFIX = 'uuid__';
const SLUG_PARAM_PREFIX = 'slug__';
const SLUG_REGEX = /^[a-zA-Z0-9-%]+$/;

@Injectable()
export class ParamValidationGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        const params = req.params ?? {};

        for (const key of Object.keys(params)) {
            const value = params[key] as string;
            if (key.startsWith(UUID_PARAM_PREFIX)) {
                if (!isUUID(value, '4')) {
                    throw new NotFoundException();
                }
                req.params[key.slice(UUID_PARAM_PREFIX.length)] = value;
                delete req.params[key];
            } else if (key.startsWith(SLUG_PARAM_PREFIX)) {
                if (!SLUG_REGEX.test(value)) {
                    throw new NotFoundException();
                }
                req.params[key.slice(SLUG_PARAM_PREFIX.length)] = value;
                delete req.params[key];
            }
        }

        return true;
    }
}
