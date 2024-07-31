import { Push } from './push';

export interface PusherInterface {
    push(notification: Push): Promise<void>;
}
