import { Inject, Injectable } from '@nestjs/common';
import { Push, PusherInterface } from '@libs/pusher';
import { PushReceiverInterface } from '../contract/receiver/push-receiver-interface';
import { NotificationManagerInterface } from '../contract/notification-manager.interface';
import { PushBadgeHandler } from '../service/push-badge-handler';

@Injectable()
export class PushNotificationManager implements NotificationManagerInterface {
    constructor(
        @Inject('Pusher') private readonly pusher: PusherInterface,
        private readonly pushBadgeHandler: PushBadgeHandler,
    ) {}

    public async process(receiver: PushReceiverInterface, push: Push, useBadge: boolean): Promise<void> {
        const devices = await receiver.getDevices();
        if (!this.pusher) {
            throw new Error('Pusher service missing. Connect PusherModule.');
        }

        if (!devices.length) {
            return;
        }

        let badge: number | undefined;
        // if (useBadge) {
        //     const pushBadge = await this.pushBadgeHandler.handle(receiver.getId());
        //     badge = pushBadge.badge;
        // }

        if (await receiver.isNotificationEnabled()) {
            for (const device of devices) {
                const sound = (await receiver.isSoundEnabled()) ? push?.sound : '';
                await this.pusher.push({ ...push, sound, badge, device });
            }
        } else if (await receiver.isDataOnlyEnabled()) {
            for (const device of devices) {
                const { priority, data } = push;
                await this.pusher.push({ dataOnly: true, priority, device, badge, data });
            }
        }
    }
}
