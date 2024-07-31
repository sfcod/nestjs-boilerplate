import { User } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserUpdateVoter } from '@app/client/security/voter/user/user-update.voter';

@Injectable()
export class UpdateUserGuard implements CanActivate {
    constructor(
        private readonly em: EntityManager,
        private readonly voter: UserUpdateVoter,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const subject = await this.em.findOneOrFail(User, { id: request.params.id });

        return await this.voter.vote(subject, request.user);
    }
}
