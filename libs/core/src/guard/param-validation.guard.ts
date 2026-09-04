import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { isUUID } from 'class-validator';

const UUID_PARAM_PREFIX = 'uuid__';
const SLUG_PARAM_PREFIX = 'slug__';
const NUMBER_PARAM_PREFIX = 'number__';
const STRING_PARAM_PREFIX = 'string__';
const SLUG_REGEX = /^[a-zA-Z0-9-%]+$/;
const NUMBER_REGEX = /^[0-9]+$/;
const STRING_REGEX = /^[a-z0-9]+$/;

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
            } else if (key.startsWith(NUMBER_PARAM_PREFIX)) {
                if (!NUMBER_REGEX.test(value)) {
                    throw new NotFoundException();
                }
                req.params[key.slice(NUMBER_PARAM_PREFIX.length)] = value;
                delete req.params[key];
            } else if (key.startsWith(STRING_PARAM_PREFIX)) {
                if (!STRING_REGEX.test(value)) {
                    throw new NotFoundException();
                }
                req.params[key.slice(STRING_PARAM_PREFIX.length)] = value;
                delete req.params[key];
            }
        }

        return true;
    }
}
