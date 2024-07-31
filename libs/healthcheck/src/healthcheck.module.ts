import { DynamicModule, Module } from '@nestjs/common';
import { Type } from '@nestjs/common/interfaces/type.interface';
import { createHealthGatewayAction } from './action/health-gateway-action';

export interface ActionOptions {
    actions: {
        actionName: 'HealthGatewayAction';
        route: string;
        guards: any[];
    }[];
}

@Module({})
export class HealthcheckModule {
    static register(): DynamicModule {
        return {
            module: HealthcheckModule,
            exports: [],
            providers: [],
        };
    }

    static registerActions(options: ActionOptions): Array<Type> {
        return options.actions.map(({ actionName, ...rest }) => {
            switch (actionName) {
                case 'HealthGatewayAction':
                    return createHealthGatewayAction(rest);
            }
        });
    }
}
