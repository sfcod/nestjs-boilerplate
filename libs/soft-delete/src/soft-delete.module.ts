import { Global, Module } from '@nestjs/common';
import { SoftDeleteSubscriber } from './entity-subscriber/soft-delete-subscriber';
import { RestoreSubscriber } from './entity-subscriber/restore-subscriber';

@Global()
@Module({
    controllers: [],
    imports: [],
    providers: [SoftDeleteSubscriber, RestoreSubscriber],
})
export class SoftDeleteModule {}
