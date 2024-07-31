import { ModuleRef } from '@nestjs/core';

export interface ReceiverInterface {
    setModuleRef(moduleRef: ModuleRef): void;

    getModuleRef(): ModuleRef;
}
