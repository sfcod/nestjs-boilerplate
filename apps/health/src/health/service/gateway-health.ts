import { Inject, Injectable } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator } from '@nestjs/terminus';

@Injectable()
export class GatewayHealth {
    constructor(
        private readonly health: HealthCheckService,
        private readonly http: HttpHealthIndicator,
        @Inject('API_URL') private readonly apiUrl: string,
    ) {}

    async check() {
        const healthGateways = [
            'api/healthcheck',
            'api-admin/healthcheck',
            'api-arkit3/healthcheck',
        ].map((url) => `${this.apiUrl}/${url}`);

        return healthGateways.map((url) => () => {
            return this.http.pingCheck(url, url);
        });
    }
}
