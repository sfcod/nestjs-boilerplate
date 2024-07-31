import { MailReceiverInterface } from '../../contract/receiver/mail-receiver-interface';
import { Admin, User, AdminStatus, UserStatus } from '@libs/orm';
import { AbstractReceiver } from './abstract-receiver';

export class UserMailReceiver<T extends { email: string }> extends AbstractReceiver implements MailReceiverInterface {
    constructor(private readonly user: T) {
        super();
    }

    public async getEmail(): Promise<string> {
        return this.user.email;
    }

    async isEmailEnabled(): Promise<boolean> {
        if (!(this.user instanceof User || this.user instanceof Admin)) {
            return true;
        }

        if (this.user instanceof Admin) {
            return this.user.status === AdminStatus.STATUS_ACTIVE;
        }

        // If the user is inactive or locked, skip the email sending process.
        if ([UserStatus.STATUS_INACTIVE].includes(this.user.status)) {
            return false;
        }

        // If the user has been archived, please skip the email sending process.
        if (this.user.deletedAt) {
            return false;
        }

        return true;
    }

    public async getTemplate(): Promise<string> {
        return 'default';
    }
}
