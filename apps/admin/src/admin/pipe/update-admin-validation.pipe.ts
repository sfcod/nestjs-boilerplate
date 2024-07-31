import { Inject, Injectable, Scope, ValidationError } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { Request } from 'express';
import { createValidationError, AbstractHttpValidationPipe } from '@libs/core';
import { UpdateAdminInput } from '../dto/input/update-admin-input';
import { AdminStatus, Admin } from '@libs/orm';
import { AdminDeactivateVoter } from '@app/admin/security/voter/admin/admin-deactivate.voter';
import { UserInterface } from '@libs/security';

@Injectable({ scope: Scope.REQUEST })
export class UpdateAdminValidationPipe extends AbstractHttpValidationPipe<UpdateAdminInput> {
    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly em: EntityManager,
        private readonly deactivateVoter: AdminDeactivateVoter,
    ) {
        super();
    }

    async validate(data: UpdateAdminInput): Promise<ValidationError[]> {
        const { id } = this.request.params;
        const user = this.request.user as UserInterface;
        const errors: ValidationError[] = [];
        const admin = await this.em.findOneOrFail(Admin, id);

        if (admin.status === AdminStatus.STATUS_ACTIVE && data.status === AdminStatus.STATUS_INACTIVE) {
            if (!(await this.deactivateVoter.vote(admin, user))) {
                errors.push(createValidationError(data, 'status', 'You cant deactivate your own profile'));
            }
        }

        return errors;
    }
}
