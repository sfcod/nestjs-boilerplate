import { DynamicModule, ExistingProvider, FactoryProvider, Module, Type } from '@nestjs/common';
import { NotificationEmitter } from './service/notification-emitter';
import { AbstractNotificationEvent } from './contract/event/abstract-notification-event';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { NotificationManagerInterface } from './contract/notification-manager.interface';
import { DbNotificationManager } from './notification-manager/db-notification-manager';
import { MailNotificationManager } from './notification-manager/mail-notification-manager';
import { PushNotificationManager } from './notification-manager/push-notification-manager';
import { SmsNotificationManager } from './notification-manager/sms-notification-manager';
import { PushBadgeHandler } from './service/push-badge-handler';

export interface NotificationModuleOptions extends Pick<ModuleMetadata, 'imports'> {
    pushNotificationManager?:
        | Type<NotificationManagerInterface>
        | FactoryProvider<NotificationManagerInterface>
        | Omit<ExistingProvider<NotificationManagerInterface>, 'provider'>;
    dbNotificationManager?:
        | Type<NotificationManagerInterface>
        | FactoryProvider<NotificationManagerInterface>
        | Omit<ExistingProvider<NotificationManagerInterface>, 'provider'>;
    mailNotificationManager?:
        | Type<NotificationManagerInterface>
        | FactoryProvider<NotificationManagerInterface>
        | Omit<ExistingProvider<NotificationManagerInterface>, 'provider'>;
    smsNotificationManager?:
        | Type<NotificationManagerInterface>
        | FactoryProvider<NotificationManagerInterface>
        | Omit<ExistingProvider<NotificationManagerInterface>, 'provider'>;
    events?: Array<new (...args: any[]) => AbstractNotificationEvent>;
    // push?: PusherModuleOptions;
    // db?: any;
    // mail?: MailerOptions;
}

@Module({})
export class NotificationModule {
    static register(options?: NotificationModuleOptions): DynamicModule {
        const opts: NotificationModuleOptions = {
            imports: [],
            events: [],
            dbNotificationManager: DbNotificationManager,
            pushNotificationManager: PushNotificationManager,
            mailNotificationManager: MailNotificationManager,
            smsNotificationManager: SmsNotificationManager,
            ...options,
        };
        const list = new Set<string>();
        opts.events.map((event) => {
            Object.getOwnPropertyNames(event.prototype).map((method) => list.add(method));
        });
        const managers: Array<any> = [];
        list.has('toMail') &&
            managers.push(
                this.registerProvider<NotificationManagerInterface>(
                    'MailNotificationManager',
                    opts.mailNotificationManager,
                ),
            );
        list.has('toDb') &&
            managers.push(
                this.registerProvider<NotificationManagerInterface>(
                    'DbNotificationManager',
                    opts.dbNotificationManager,
                ),
            );
        list.has('toPush') &&
            managers.push(
                this.registerProvider<NotificationManagerInterface>(
                    'PushNotificationManager',
                    opts.pushNotificationManager,
                ),
            );
        list.has('toSms') &&
            managers.push(
                this.registerProvider<NotificationManagerInterface>(
                    'SmsNotificationManager',
                    opts.smsNotificationManager,
                ),
            );

        return {
            module: NotificationModule,
            exports: [NotificationEmitter],
            imports: [...(opts.imports || [])],
            providers: [
                ...opts.events.map((item) => ({
                    provide: item,
                    useClass: item,
                })),
                ...managers,
                NotificationEmitter,
                PushBadgeHandler,
            ],
        };
    }

    private static registerProvider<T>(
        name: string,
        provider?: Type<T> | FactoryProvider<T> | Omit<ExistingProvider<T>, 'provider'>,
    ): any {
        if (typeof provider === 'function') {
            return {
                provide: name,
                useClass: provider,
            };
        }

        if (typeof provider === 'object') {
            return {
                ...provider,
                provide: name,
            };
        }

        throw new Error('Can not process provider');
    }
}
