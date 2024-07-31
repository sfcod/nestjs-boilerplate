import { Injectable } from '@nestjs/common';
import { VoterInterface, UserInterface, matchRoles } from '@libs/security';
import { AdminRole, Admin } from '@libs/orm';

@Injectable()
export class AdminDeactivateVoter implements VoterInterface<Admin> {
    async vote(subject: Admin, user?: UserInterface): Promise<boolean> {
        switch (true) {
            case matchRoles([AdminRole.ROLE_SYSTEM_ADMIN], user.getRoles()):
                return this.canSystemAdmin(subject, user as Admin);

            default:
                return false;
        }
    }

    private async canSystemAdmin(admin: Admin, user: Admin) {
        return admin.id !== user.id;
    }
}
