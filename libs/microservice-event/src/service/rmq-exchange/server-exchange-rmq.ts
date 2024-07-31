import { PATTERN_METADATA, RQM_DEFAULT_NOACK } from '@nestjs/microservices/constants';
import { RmqOptions } from '@nestjs/microservices/interfaces';
import { Injectable, Logger } from '@nestjs/common';
import { MetadataScanner, NestContainer } from '@nestjs/core';
import { GracefulServerRMQ } from '../graceful-server-rmq';

@Injectable()
export class ServerExchangeRmq extends GracefulServerRMQ {
    protected readonly exchange?: string;
    protected readonly exchangeType?: string;
    protected readonly exchangeOptions?: any;
    protected readonly container: NestContainer;

    constructor(application, options: any) {
        super(options as RmqOptions['options']);
        this.container = application.container;

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.logger = new Logger(`${ServerExchangeRmq.name}|${this.queue}`);

        // Reflect.get(PATTERN_METADATA, )

        this.exchange = this.getOptionsProp(options, 'exchange', 'broadcast');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.queue = `${this.exchange}_${this.queue}`;
        this.exchangeType = this.getOptionsProp(options, 'exchangeType', 'fanout');
        this.exchangeOptions = this.getOptionsProp(options, 'exchangeOptions', {});
    }

    async setupChannel(channel, callback) {
        if (this.closing) {
            return;
        }

        const { patterns = this.scanPatterns(), queueOptions } = this.exchangeOptions;
        const noAck = this.getOptionsProp(this.options, 'noAck', RQM_DEFAULT_NOACK);
        await channel.assertExchange(this.exchange, this.exchangeType, this.exchangeOptions);
        const result = await channel.assertQueue(
            this.queue,
            this.queue ? { exclusive: false, ...queueOptions } : queueOptions,
        );
        switch (this.exchangeType) {
            case 'direct':
            case 'topic':
                // await channel.unbindQueue(result.queue, this.exchange, '*');
                for (const pattern of patterns) {
                    await channel.bindQueue(result.queue, this.exchange, pattern);
                }
                break;
            default:
                await channel.bindQueue(result.queue, this.exchange, '');
        }

        await channel.prefetch(this.prefetchCount, this.isGlobalPrefetchCount);
        const { consumerTag } = await channel.consume(result.queue, (msg) => this.handleMessage(msg, channel), {
            noAck,
        });

        this.consumerTag = consumerTag;

        callback();
    }

    scanPatterns(): string[] {
        const modules = this.container.getModules();
        const metadataScanner = new MetadataScanner();
        const patterns = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        modules.forEach(({ controllers }, moduleRef) =>
            controllers.forEach((wrapper) => {
                const { instance } = wrapper;
                const instancePrototype = Object.getPrototypeOf(instance);
                metadataScanner.scanFromPrototype(instance, instancePrototype, (methodKey) => {
                    const targetCallback = instancePrototype[methodKey];
                    const pattern = Reflect.getMetadata(PATTERN_METADATA, targetCallback);
                    pattern ? patterns.push(...pattern) : undefined;
                });
            }),
        );

        return patterns;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendMessage<T = any>(message: T, replyTo: any, correlationId: string) {
        throw new Error('Exchange does not support req-res pattern');
    }
}
