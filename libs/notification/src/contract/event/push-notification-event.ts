import { Push } from '@libs/pusher';
import { PushReceiverInterface } from '../receiver/push-receiver-interface';

export type ToPushData = {
    receiver: PushReceiverInterface;
    push: Push;
    useBadge: boolean;
};

export interface PushNotificationEvent {
    toPush(): Promise<ToPushData>;
}
