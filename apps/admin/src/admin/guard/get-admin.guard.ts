import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { EntityManager } from '@mikro-orm/core';
import { SignerBuilder, UserInterface } from '@libs/security';
import { Admin } from '@libs/orm';

@Injectable()
export class GetAdminGuard implements CanActivate {
    constructor(
        private readonly em: EntityManager,
        private readonly signerBuilder: SignerBuilder,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        const user = request.user as UserInterface;
        const admin = await this.em.findOneOrFail(Admin, request.params.id);

        if (admin.id !== user.getUuid()) {
            return this.signerBuilder.signedBy('fully');
        }

        return true;
    }
}
