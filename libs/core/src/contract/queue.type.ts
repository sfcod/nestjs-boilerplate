import { DELETE_USER_DATA_QUEUE } from '../constant/queue-constant';

export type DeleteUserDataQueueType = {
    user: string;
};

type QueueInputs = {
    [DELETE_USER_DATA_QUEUE]: DeleteUserDataQueueType;
};

export type QueueInputType<T extends keyof QueueInputs> = QueueInputs[T];
