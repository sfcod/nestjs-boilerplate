const env = () => {
    switch (process.env.NODE_ENV) {
        case 'test':
            return ['.env.test', '.env.test.local'];
        default:
            return ['.env.local'];
    }
};

export default {
    isGlobal: true,
    envFilePath: ['.env', ...env()],
};
