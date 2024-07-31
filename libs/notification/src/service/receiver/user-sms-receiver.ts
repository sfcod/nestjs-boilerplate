import { SmsReceiverInterface } from '../../contract/receiver/sms-receiver-interface';
import { AbstractReceiver } from './abstract-receiver';

export class UserSmsReceiver<T extends { phoneNumber: string }>
    extends AbstractReceiver
    implements SmsReceiverInterface
{
    constructor(private readonly user: T) {
        super();
    }

    public async getPhoneNumber(): Promise<string> {
        return this.user.phoneNumber;
    }
}
