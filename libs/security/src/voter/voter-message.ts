import { UserInterface } from '../contract/user-interface';
import { VoterInterface } from './voter.interface';
import { ForbiddenException } from '@nestjs/common';
import { VoterException } from './voter-exception';

export abstract class VoterMessage<T, U = UserInterface> implements VoterInterface<T, U> {
    abstract voteOn(subject: T, user?: U): Promise<boolean>;

    async forbiddenUnlessGranted(subject: T, user?: U): Promise<boolean> {
        try {
            return await this.voteOn(subject, user);
        } catch (e) {
            if (e instanceof VoterException) {
                throw new ForbiddenException(e.message);
            }
            throw e;
        }
    }

    async vote(subject: T, user?: U): Promise<boolean> {
        try {
            return await this.voteOn(subject, user);
        } catch (e) {
            if (e instanceof VoterException) {
                return false;
            }

            throw e;
        }
    }
}
