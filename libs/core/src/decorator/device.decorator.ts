import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { Device as DeviceDTO } from '../dto/device';

export const DeviceParam = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.device;

    // const headers = request.headers;
    //
    // if (
    //     headers.hasOwnProperty('device-id') &&
    //     headers.hasOwnProperty('device-name') &&
    //     headers.hasOwnProperty('device-os')
    // ) {
    //     const { 'device-id': id, 'device-name': name, 'device-os': os } = headers;
    //
    //     return new DeviceDTO(id, name, os);
    // }
    //
    // return null;
});
