import { Module } from '@nestjs/common';
import { EnumListAction } from './actions/enum/enum-list-action';
import { HealthcheckModule } from '@libs/healthcheck';

@Module({
    controllers: [
        EnumListAction,
        ...HealthcheckModule.registerActions({
            actions: [
                {
                    actionName: 'HealthGatewayAction',
                    route: 'api/healthcheck',
                    guards: [],
                },
            ],
        }),
    ],
    imports: [],
})
export class PublicModule {}
