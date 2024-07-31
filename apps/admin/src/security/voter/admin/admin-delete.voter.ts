import { Injectable } from '@nestjs/common';
import { matchRoles, UserInterface, VoterException, VoterMessage } from '@libs/security';
import { AccessKey, AdminRole, Admin } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class AdminDeleteVoter extends VoterMessage<Admin> {
    constructor(private readonly em: EntityManager) {
        super();
    }

    async voteOn(subject: Admin, user: UserInterface | undefined): Promise<boolean> {
        switch (true) {
            case matchRoles([AdminRole.ROLE_SYSTEM_ADMIN], user.getRoles()):
                return this.canSystemAdmin(subject, user as Admin);

            default:
                return false;
        }
    }

    private async canSystemAdmin(admin: Admin, user: Admin) {
        const keysCount = await this.em.count(AccessKey, { owner: admin });

        if (keysCount > 0) {
            throw new VoterException('Access key creator can’t be deleted.');
        }

        return admin.id !== user.id && keysCount === 0;
    }
}
