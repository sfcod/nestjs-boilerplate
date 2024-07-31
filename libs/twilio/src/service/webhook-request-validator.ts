import * as Twilio from 'twilio';
import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class WebhookRequestValidator {
    constructor(@Inject('TWILIO_CREDENTIALS') private readonly credentials) {}

    validate(request: Request) {
        return Twilio.validateRequest(
            this.credentials.authToken,
            request.header('X-Twilio-Signature'),
            this.fullUrl(request),
            request.body,
        );
    }

    private fullUrl(request: Request) {
        return `https://${request.hostname}${request.originalUrl}`;
    }
}
