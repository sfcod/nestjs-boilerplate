import { User } from '@libs/orm';
import { PushReceiverInterface } from '../../contract/receiver/push-receiver-interface';
import { AbstractReceiver } from './abstract-receiver';

export class DisabledPushReceiver extends AbstractReceiver implements PushReceiverInterface {
    constructor(protected readonly user: User) {
        super();
    }

    public getId(): string {
        return this.user.id;
    }

    public async getDevices(): Promise<string[]> {
        return (await this.user.devices.loadItems()).map(({ token }) => token);
    }

    public async isDataOnlyEnabled(): Promise<boolean> {
        return process.env.NODE_ENV === 'test';
    }

    public async isNotificationEnabled(): Promise<boolean> {
        return false;
    }

    public async isSoundEnabled(): Promise<boolean> {
        return false;
    }
}
