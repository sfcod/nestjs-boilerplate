import { ClientRMQ, ReadPacket, WritePacket } from '@nestjs/microservices';
import { RmqOptions } from '@nestjs/microservices/interfaces';
import { RQM_DEFAULT_QUEUE, RQM_DEFAULT_QUEUE_OPTIONS } from '@nestjs/microservices/constants';
import { BeforeApplicationShutdown, Injectable } from '@nestjs/common';

@Injectable()
export class ClientExchangeRmq extends ClientRMQ implements BeforeApplicationShutdown {
    protected readonly exchange?: string;
    protected readonly exchangeType?: string;
    protected readonly exchangeOptions?: any;

    constructor(options: any) {
        super(options as RmqOptions['options']);

        if (this.queue !== RQM_DEFAULT_QUEUE || this.queueOptions !== RQM_DEFAULT_QUEUE_OPTIONS) {
            throw new Error('Client does not support those options.');
        }
        this.exchange = this.getOptionsProp(options, 'exchange', 'broadcast');
        this.exchangeType = this.getOptionsProp(options, 'exchangeType', 'fanout');
        // this.exchangeOptions = this.getOptionsProp(options, 'exchangeOptions', { durable: false });
    }

    public async setupChannel(channel, resolve) {
        // const prefetchCount = this.getOptionsProp(this.options, 'prefetchCount') || RQM_DEFAULT_PREFETCH_COUNT;
        // const isGlobalPrefetchCount =
        //     this.getOptionsProp(this.options, 'isGlobalPrefetchCount') || RQM_DEFAULT_IS_GLOBAL_PREFETCH_COUNT;
        await channel.assertExchange(this.exchange, this.exchangeType, {});
        // await channel.assertQueue(this.queue, this.queueOptions);
        // await channel.prefetch(prefetchCount, isGlobalPrefetchCount);
        // this.responseEmitter = new EventEmitter();
        // this.responseEmitter.setMaxListeners(0);
        // this.consumeChannel();
        resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected publish(message: ReadPacket, callback: (packet: WritePacket) => any): any {
        throw new Error('Exchange does not support req-res pattern.');
    }

    protected dispatchEvent(packet: ReadPacket): Promise<any> {
        const serializedPacket = this.serializer.serialize(packet);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<void>((resolve) => {
            switch (this.exchangeType) {
                case 'direct':
                case 'topic':
                    this.channel.publish(this.exchange, packet.pattern, Buffer.from(JSON.stringify(serializedPacket)));
                    break;
                default:
                    this.channel.publish(this.exchange, '', Buffer.from(JSON.stringify(serializedPacket)));
            }
            resolve();
        });
    }

    public beforeApplicationShutdown() {
        this.close();
    }
}
