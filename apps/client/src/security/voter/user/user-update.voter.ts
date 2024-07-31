import { VoterInterface, matchRoles, UserInterface } from '@libs/security';
import { User } from '@libs/orm';
import { Injectable } from '@nestjs/common';
import { UserRole } from '@libs/orm';
import { AbstractUserVoter } from './abstract-user.voter';

@Injectable()
export class UserUpdateVoter extends AbstractUserVoter implements VoterInterface<User> {
    async vote(subject: User, user?: UserInterface): Promise<boolean> {
        switch (true) {
            case matchRoles([UserRole.ROLE_USER], user.getRoles()):
                return await this.canUser(subject, user as User);
        }

        return false;
    }

    private async canUser(subject: User, user: User): Promise<boolean> {
        return subject.id === user.id && this.isActive(user);
    }
}
