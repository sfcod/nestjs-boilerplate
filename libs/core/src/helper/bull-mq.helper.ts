import bullMqConfig from '../../../../config/bull-mq.config';

export const registerQueue = (name: string) => {
    if (bullMqConfig[name]) {
        return bullMqConfig[name];
    }
    throw new Error(`Queue "${name}" not found`);
};
