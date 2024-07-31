import { EntityManager, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { entityMeta } from '../service/entity-meta';
import { FileHelper } from '../service/file-helper';
import { StorageManager } from '@slynova/flydrive';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class OrmRemoveSubscriber implements EventSubscriber<any> {
    private readonly entityMeta = entityMeta;

    constructor(
        private readonly em: EntityManager,
        private readonly fileHelper: FileHelper,
        private readonly storageManager: StorageManager,
        @Inject('MAPPING') private mapping,
    ) {
        em.getEventManager().registerSubscriber(this);
    }

    public async afterDelete?(args: EventArgs<any>): Promise<void> {
        const { entity } = args;
        const fields: string[] = this.entityMeta.getFieldNames(entity);
        for (const fieldName of fields) {
            const filePath: string | undefined = await this.fileHelper.getPath(entity, fieldName);
            const disk = await this.fileHelper.getDisk(entity, fieldName);
            if (filePath === undefined) {
                return;
            }

            await disk.delete(filePath);
        }
    }
}
