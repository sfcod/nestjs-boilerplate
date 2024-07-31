import { UserInterface } from '../contract/user-interface';

export interface VoterInterface<T, U = UserInterface> {
    vote(subject: T, user?: U): Promise<boolean>;
}
