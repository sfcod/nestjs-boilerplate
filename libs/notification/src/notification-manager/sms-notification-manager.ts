import { Injectable } from '@nestjs/common';
import { NotificationManagerInterface } from '../contract/notification-manager.interface';
import { SmsSender } from '@libs/twilio';
import { SmsReceiverInterface } from '../contract/receiver/sms-receiver-interface';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

@Injectable()
export class SmsNotificationManager implements NotificationManagerInterface {
    constructor(private readonly smsSender: SmsSender) {}

    public async process(receiver: SmsReceiverInterface, sms: MessageListInstanceCreateOptions): Promise<void> {
        await this.smsSender.send({
            ...sms,
            to: await receiver.getPhoneNumber(),
        });
    }
}
