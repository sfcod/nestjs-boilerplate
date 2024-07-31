import { Inject, Injectable } from '@nestjs/common';
import * as Twilio from 'twilio';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { InvalidPhoneNumberException } from '../exception/invalid-phone-number.exception';

@Injectable()
export class SmsSender {
    constructor(
        private readonly client: Twilio.Twilio,
        @Inject('TWILIO_CREDENTIALS') private readonly credentials,
    ) {}

    public async send({ from, to, ...sms }: MessageListInstanceCreateOptions) {
        try {
            await this.client.messages.create({
                ...sms,
                to: this.preparePhoneNumber(to),
                ...(this.credentials.messagingServiceSid
                    ? {
                          messagingServiceSid: this.credentials.messagingServiceSid,
                      }
                    : {
                          from: this.preparePhoneNumber(from ?? this.credentials.smsFromNumber),
                      }),
            });
        } catch (e) {
            if (e.message.indexOf('valid phone number') > -1) {
                throw new InvalidPhoneNumberException(e.message);
            }

            throw e;
        }
    }

    private preparePhoneNumber(phoneNumber: string | number): string {
        const phone = `${phoneNumber}`;
        const defaultCountryCode = '+1';

        return phone?.[0] === '+' ? phone : `${defaultCountryCode}${phone}`;
    }
}
