import { SmsReceiverInterface } from '../../contract/receiver/sms-receiver-interface';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';

export type ToSmsData = {
    receiver: SmsReceiverInterface;
    sms: Omit<MessageListInstanceCreateOptions, 'to'>;
};

export interface SmsNotificationEvent {
    toSms(): Promise<ToSmsData>;
}
