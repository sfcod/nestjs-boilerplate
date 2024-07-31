import { Controller, Get, Type, UseGuards } from '@nestjs/common';
import { JsonOutput } from '@libs/core';

export const createHealthGatewayAction = ({ route, guards }: { route: string; guards: any[] }): Type<any> => {
    @Controller(route || `health`)
    class HealthGatewayAction {
        @UseGuards(...guards)
        @Get()
        async invoke(): Promise<JsonOutput> {
            return new JsonOutput({});
        }
    }

    return HealthGatewayAction;
};
