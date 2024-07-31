import { Device } from '../dto/device';
import { getClientIp } from 'request-ip';

export function deviceMiddleware(request, response, next: () => void) {
    const headers = request.headers;

    if (
        headers.hasOwnProperty('device-id') &&
        headers.hasOwnProperty('device-name') &&
        headers.hasOwnProperty('device-os')
    ) {
        const { 'device-id': id, 'device-name': name, 'device-os': os } = headers;

        request.device = new Device(id, name, os, getClientIp(request));
    }

    next();
}
