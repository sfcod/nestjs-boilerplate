const isProd = process.env.NODE_ENV === 'production';

export default {
    config: {
        url: process.env.REDIS_URL,
        // tls: isProd ? {} : undefined,
        tls: undefined,
        retryStrategy: (times) => Math.min(times * 30, 1000),
        reconnectOnError: (error) => {
            return false;
            const targetErrors = [/READONLY/, /ETIMEDOUT/];

            targetErrors.forEach((targetError) => {
                if (targetError.test(error.message)) {
                    return true;
                }
            });

            return false;
        },
    },
    closeClient: true,
    readyLog: true,
    errorLog: true,
};
