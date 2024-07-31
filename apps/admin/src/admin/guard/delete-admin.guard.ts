import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { UserInterface } from '@libs/security';
import { Admin } from '@libs/orm';
import { AdminDeleteVoter } from '@app/admin/security/voter/admin/admin-delete.voter';

@Injectable()
export class DeleteAdminGuard implements CanActivate {
    constructor(
        private readonly em: EntityManager,
        private readonly voter: AdminDeleteVoter,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        const admin = await this.em.findOneOrFail(Admin, request.params.id);

        return await this.voter.forbiddenUnlessGranted(admin, request.user as UserInterface);
    }
}
