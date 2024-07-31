import { UserInterface, VoterInterface } from '@libs/security';
import { Injectable } from '@nestjs/common';
import { User, UserStatus } from '@libs/orm';

@Injectable()
export abstract class AbstractUserVoter implements VoterInterface<User> {
    abstract vote(subject: User, user?: UserInterface): Promise<boolean>;

    protected isActive(user: User): boolean {
        return [
            UserStatus.STATUS_ACTIVE,
            UserStatus.STATUS_PENDING_EMAIL_VERIFICATION,
            UserStatus.STATUS_PENDING_PHONE_VERIFICATION,
        ].includes(user.status);
    }
}
