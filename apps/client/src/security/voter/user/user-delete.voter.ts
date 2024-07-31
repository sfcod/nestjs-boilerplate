import { Injectable } from '@nestjs/common';
import { User } from '@libs/orm';
import { matchRoles, UserInterface, VoterInterface } from '@libs/security';
import { UserRole } from '@libs/orm';

@Injectable()
export class UserDeleteVoter implements VoterInterface<User> {
    async vote(subject: User, user?: UserInterface): Promise<boolean> {
        switch (true) {
            case matchRoles([UserRole.ROLE_USER], user.getRoles()):
                return subject?.id === user?.getUuid();
        }

        return false;
    }
}
