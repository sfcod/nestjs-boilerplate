import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckService, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitHealth {
    constructor(
        private readonly health: HealthCheckService,
        private readonly microservice: MicroserviceHealthIndicator,
        @Inject('RABBITMQ_URLS') private readonly rabbitUrls: string[],
    ) {}

    async check() {
        return [
            () =>
                this.microservice.pingCheck('rabbit', {
                    transport: Transport.RMQ,
                    options: {
                        urls: this.rabbitUrls,
                    },
                }),
        ];
    }
}
