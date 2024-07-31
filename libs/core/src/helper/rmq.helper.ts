import { ClientProviderOptions, ClientTCP, MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RmqOptions, ClientProxy } from '@nestjs/microservices';
import { ClientExchangeRmq, ServerExchangeRmq } from '@libs/microservice-event';
import { INestApplication } from '@nestjs/common';

/**
 * Usage: ClientsModule.register([registerRmqQueue('queue-name', { queueOptions: { durable: true } })])
 *
 * The only purpose is to make it easier to register queue with rmq transport. Also, it uses another transport
 * for test environment because rmq may cause issues with jest and gitlab ci.
 *
 * Same applies for other helpers in this file.
 */
export const registerRmqQueue = (name: string, opts: ClientProviderOptions['options']): ClientProviderOptions => {
    // needed for testing
    return process.env.NODE_ENV === 'test'
        ? { name, transport: Transport.TCP }
        : {
              name,
              transport: Transport.RMQ,
              options: {
                  urls: process.env.RABBITMQ_URLS.split(','),
                  queueOptions: {
                      durable: true,
                  },
                  ...opts,
              },
          };
};

export const registerRmqExchange = (opts: RmqOptions['options'] = {}): ClientProxy => {
    return process.env.NODE_ENV === 'test' // @TODO: get exchange type from env
        ? new ClientTCP({})
        : new ClientExchangeRmq({
              urls: process.env.RABBITMQ_URLS.split(','),
              exchange: process.env.RABBITMQ_EXCHANGE_NAME,
              exchangeType: 'direct',
              ...opts,
          });
};

export const connectRmqMicroservice = (
    app: INestApplication,
    queue: string,
    strategyOpts: Record<string, any> = {},
) => {
    return app.connectMicroservice<MicroserviceOptions>(
        process.env.NODE_ENV === 'test'
            ? {
                  transport: Transport.TCP,
              }
            : {
                  strategy: new ServerExchangeRmq(app, {
                      urls: process.env.RABBITMQ_URLS.split(','),
                      queue: queue,
                      exchange: process.env.RABBITMQ_EXCHANGE_NAME,
                      exchangeType: 'direct',
                      exchangeOptions: {
                          durable: true,
                      },
                      ...strategyOpts,
                  }),
              },
    );
};
