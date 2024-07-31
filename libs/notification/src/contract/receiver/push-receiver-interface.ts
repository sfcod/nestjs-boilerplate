import { ReceiverInterface } from './receiver-interface';

export interface PushReceiverInterface extends ReceiverInterface {
    getId(): string;

    getDevices(): Promise<string[]>;

    isNotificationEnabled(): Promise<boolean>;

    isSoundEnabled(): Promise<boolean>;

    isDataOnlyEnabled(): Promise<boolean>;
}
