import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WebhookRequestValidator } from '../service/webhook-request-validator';

@Injectable()
export class WebhookTwilioRequestGuard implements CanActivate {
    constructor(private readonly validator: WebhookRequestValidator) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        return this.validator.validate(request);
    }
}
