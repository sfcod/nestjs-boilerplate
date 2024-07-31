import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class HealthGuard implements CanActivate {
    constructor() {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { headers } = request;

        return headers['user-agent'].includes('ELB-HealthChecker');
    }
}
