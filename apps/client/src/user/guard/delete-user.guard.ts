import { User } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';
import { UserDeleteVoter } from '@app/client/security/voter/user/user-delete.voter';
import { CanActivate, ExecutionContext, Injectable, Scope } from '@nestjs/common';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';

@Injectable({ scope: Scope.REQUEST })
export class DeleteUserGuard implements CanActivate {
    constructor(
        private readonly em: EntityManager,
        private readonly voter: UserDeleteVoter,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const subject = await this.em.findOneOrFail(
            User,
            { id: request.params.id },
            {
                filters: { [SOFT_DELETABLE_QUERY_FILTER]: false },
            },
        );

        return await this.voter.vote(subject, request.user);
    }
}
