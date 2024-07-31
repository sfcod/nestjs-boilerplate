import { ReceiverInterface } from './receiver-interface';

export interface SmsReceiverInterface extends ReceiverInterface {
    getPhoneNumber(): Promise<string>;
}
