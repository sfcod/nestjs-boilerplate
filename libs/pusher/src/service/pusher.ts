import { Inject, Injectable, Logger } from '@nestjs/common';
import { PusherInterface } from '../contract/pusher.interface';
import { Push } from '../contract/push';
import admin from 'firebase-admin';
import { pickBy } from 'lodash';

@Injectable()
export class Pusher implements PusherInterface {
    protected readonly logger = new Logger(this.constructor.name);

    private isInitializedApp: boolean = false;

    constructor(@Inject('FIREBASE_CREDENTIALS') private readonly config: Record<any, any>) {}

    public async push(notification: Push): Promise<void> {
        const message = this.getBody(notification);
        const options = this.getOptions(notification);

        this.initializeFirebaseService();
        try {
            const response = await admin.messaging().sendToDevice(notification.device, message, options);
            console.log('Successfully sent message:', response);
        } catch (e: any) {
            console.error(message);
            if (e?.response) {
                const { status, statusText, config: requestConfig } = e.response;
                this.logger.error(
                    JSON.stringify({ message: `Pusher got an error: ${e.message}`, status, statusText, requestConfig }),
                    e,
                );
                console.error(e.response.data.error.details[0]);
            } else {
                this.logger.error(`Pusher got an error: ${e.message}`, e);
            }
        }
    }

    private initializeFirebaseService(): void {
        if (this.isInitializedApp === false) {
            this.isInitializedApp = true;
            admin.initializeApp({
                credential: admin.credential.cert(this.config),
            });
        }
    }

    private convertValuesToStrings(data: Record<string, any>): Record<string, string> {
        const stringifiedData: Record<string, string> = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                stringifiedData[key] = String(data[key]);
            }
        }
        return stringifiedData;
    }

    private getBody(notification: Push) {
        if (notification.data) {
            notification.data = this.convertValuesToStrings(notification.data);
        }

        const body = {
            data: notification.data,
            notification: notification.dataOnly
                ? undefined
                : {
                      title: notification.title,
                      body: notification.message,
                      sound: typeof notification.sound === 'undefined' ? 'default' : notification.sound,
                  },
        };

        return pickBy(body, (value: any) => value);
    }

    private getOptions(notification: Push) {
        if (notification.data) {
            notification.data = this.convertValuesToStrings(notification.data);
        }

        const body = {
            options: {
                android: {
                    notification: {
                        sound: typeof notification.sound === 'undefined' ? 'default' : notification.sound,
                        alert: notification.alert,
                        badge: notification.badge,
                        channel_id: notification.android_channel_id,
                    },
                    priority: notification.priority,
                },
                apns: {
                    payload: {
                        aps: {
                            sound: typeof notification.sound === 'undefined' ? 'default' : notification.sound,
                            alert: notification.alert,
                            badge: notification.badge,
                            content_available: true,
                        },
                    },
                },
            },
        };

        return pickBy(body, (value) => value);
    }
}
