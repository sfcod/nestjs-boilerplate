import { HttpModule } from '@nestjs/axios';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { Pusher } from './service/pusher';
import * as fs from 'fs';
import { resolve } from 'path';
import { path as appRoot } from 'app-root-path';

export type PusherModuleOptions = {
    cloudMessagingServerKey?: string;
};

@Global()
@Module({})
export class PusherModule {
    static register(options?: PusherModuleOptions): DynamicModule {
        const fileJsonPath = resolve(
            appRoot,
            options?.cloudMessagingServerKey ? options.cloudMessagingServerKey : 'firebase.json',
        );
        const fileContent = fs.readFileSync(fileJsonPath, 'utf-8');
        const adminCredentials = JSON.parse(fileContent);

        options = {
            ...options,
            ...adminCredentials,
        };

        return {
            module: PusherModule,
            imports: [HttpModule],
            exports: ['Pusher'],
            providers: [
                {
                    provide: 'FIREBASE_CREDENTIALS',
                    useValue: { ...options },
                },
                { provide: 'Pusher', useClass: Pusher },
            ],
        };
    }
}
