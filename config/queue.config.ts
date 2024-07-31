// const isProd = process.env.NODE_ENV === 'production';

import { QueueOptions } from 'bullmq/dist/esm/interfaces/queue-options';

export default {
    connection: {
        host: process.env.QUEUE_REDIS_HOST,
        port: parseInt(process.env.QUEUE_REDIS_PORT, 10),
        connectTimeout: 30000,
        // tls: isProd ? {} : undefined,
        tls: undefined,
        reconnectOnError: (error) => {
            const targetErrors = [/READONLY/, /ETIMEDOUT/];

            targetErrors.forEach((targetError) => {
                if (targetError.test(error.message)) {
                    return true;
                }
            });

            return false;
        },
    },
    prefix: process.env.QUEUE_PREFIX || '',
    defaultJobOptions: {
        removeOnComplete: true,
    },
} as QueueOptions;
