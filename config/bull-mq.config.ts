import { BullModule } from '@nestjs/bullmq';
import { DELETE_USER_DATA_QUEUE } from '@libs/core';

const defaultOptions = {
    timeout: 180000,
    removeOnComplete: true,
    attempts: 6,
    // 5min, 10min, 20min, 40min, 80min, 160min
    backoff: {
        type: 'exponential',
        delay: 300000,
    },
};
export default {
    [DELETE_USER_DATA_QUEUE]: BullModule.registerQueue({
        name: DELETE_USER_DATA_QUEUE,
        defaultJobOptions: defaultOptions,
    }),
};
