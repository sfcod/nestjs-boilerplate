import { Module } from '@nestjs/common';
import { AccessKeyManager } from './service/access-key-manager';
import { AccessKeyStrategy } from './strategy/access-key-strategy';

@Module({
    controllers: [],
    imports: [],
    providers: [AccessKeyManager, AccessKeyStrategy],
    exports: [AccessKeyManager],
})
export class AccessKeyModule {}
