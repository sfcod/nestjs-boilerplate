import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { WebauthnDevice } from '@libs/orm';

@Injectable()
export class WebauthnDeleteDeviceGuard implements CanActivate {
    constructor(private readonly em: EntityManager) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const device = await this.em.findOneOrFail(WebauthnDevice, {
            id: request.params.id,
            user: user.id,
        });

        return Boolean(device);
    }
}
