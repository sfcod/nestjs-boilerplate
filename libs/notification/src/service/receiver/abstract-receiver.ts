import { ReceiverInterface } from '../../contract/receiver/receiver-interface';
import { ModuleRef } from '@nestjs/core';

export abstract class AbstractReceiver implements ReceiverInterface {
    private moduleRef: ModuleRef;

    getModuleRef(): ModuleRef {
        return this.moduleRef;
    }

    setModuleRef(moduleRef: ModuleRef): void {
        this.moduleRef = moduleRef;
    }
}
