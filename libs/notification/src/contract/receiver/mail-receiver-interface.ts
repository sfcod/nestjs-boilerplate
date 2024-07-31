import { ReceiverInterface } from './receiver-interface';

export interface MailReceiverInterface extends ReceiverInterface {
    getEmail(): Promise<string>;

    isEmailEnabled(): Promise<boolean>;

    getTemplate(): Promise<string>;
}
