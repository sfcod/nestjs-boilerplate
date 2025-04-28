import { Injectable } from '@nestjs/common';
import { matchRoles, UserInterface, VoterException, VoterMessage } from '@libs/security';
import { AdminRole, Admin } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export class AdminDeleteVoter extends VoterMessage<Admin> {
    constructor(private readonly em: EntityManager) {
        super();
    }

    async voteOn(subject: Admin, user: UserInterface | undefined): Promise<boolean> {
        switch (true) {
            case matchRoles([AdminRole.ROLE_SYSTEM_ADMIN], user.getRoles()):
                return true;

            default:
                return false;
        }
    }
}
