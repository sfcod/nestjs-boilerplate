import { User } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserGetVoter } from '@app/client/security/voter/user/user-get.voter';

@Injectable()
export class GetUserGuard implements CanActivate {
    constructor(
        private readonly em: EntityManager,
        private readonly voter: UserGetVoter,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user: User = request.user;
        const subject = await this.em.findOneOrFail(User, { id: request.params.id });

        return await this.voter.vote(subject, user);
    }
}
