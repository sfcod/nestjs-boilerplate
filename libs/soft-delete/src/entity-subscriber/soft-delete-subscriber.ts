import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { Collection, Reference } from '@mikro-orm/core';
import { FlushEventArgs } from '@mikro-orm/core/events/EventSubscriber';
import { SOFT_DELETABLE_OPTIONS, SoftDeletableOptions } from '../decorator/soft-deletable.decorator';
import { AnyEntity } from '@mikro-orm/core/typings';
import * as moment from 'moment';

@Injectable()
export class SoftDeleteSubscriber {
    constructor(private readonly em: EntityManager) {
        em.getEventManager().registerSubscriber(this);
    }

    async beforeFlush({ uow }: FlushEventArgs): Promise<void> {
        const removeStack: Set<AnyEntity> = uow.getRemoveStack();
        const processedEntities: Set<AnyEntity> = new Set();
        // milliseconds
        const deletedAt = moment().valueOf();

        for (const entity of removeStack) {
            if (processedEntities.has(entity)) {
                continue;
            }
            if (Reflect.hasMetadata(SOFT_DELETABLE_OPTIONS, entity)) {
                processedEntities.add(entity);

                const { fieldName, hardDelete }: SoftDeletableOptions = this.getDecoratorOptions(entity);
                if (!entity.__meta.properties.hasOwnProperty(fieldName)) {
                    throw new Error("SoftDeleteSubscriber: object doesn't have field");
                }

                let needsHardDelete = false;
                if (entity?.[fieldName]) {
                    if (typeof hardDelete === 'function') {
                        needsHardDelete = await hardDelete(entity, this.em);
                    } else if (true === hardDelete) {
                        needsHardDelete = true;
                    }
                }

                if (needsHardDelete) {
                    // want to hard delete
                    continue;
                } else if (!entity?.[fieldName]) {
                    // field is empty then we should set it
                    entity[fieldName] = deletedAt;
                    uow.persist(entity);
                    removeStack.delete(entity);
                } else {
                    // if entity is already deleted then don't do anything, just delete from removeStack
                    removeStack.delete(entity);
                }

                for (const prop of entity.__meta.relations) {
                    const reference = Reference.unwrapReference(entity[prop.name]);
                    if (!reference) {
                        continue;
                    }

                    if (reference instanceof Collection) {
                        if (!reference.isInitialized()) {
                            continue;
                        }

                        for (const item of reference.getItems()) {
                            this.processRelation(item, removeStack, processedEntities);
                        }
                    } else {
                        this.processRelation(reference, removeStack, processedEntities);
                    }
                }
            }
        }
    }

    private processRelation(entity: AnyEntity, removeStack: Set<AnyEntity>, processedEntities: Set<AnyEntity>) {
        if (!removeStack.has(entity) || !Reflect.hasMetadata(SOFT_DELETABLE_OPTIONS, entity)) {
            removeStack.delete(entity);
            processedEntities.add(entity);
            return;
        }

        if (Reflect.hasMetadata(SOFT_DELETABLE_OPTIONS, entity)) {
            const { fieldName }: SoftDeletableOptions = this.getDecoratorOptions(entity);
            if (entity?.[fieldName]) {
                // don't remove previously softdeleted items
                removeStack.delete(entity);
                processedEntities.add(entity);
            }
        }
    }

    private getDecoratorOptions(entity: AnyEntity): SoftDeletableOptions | undefined {
        return Reflect.getMetadata(SOFT_DELETABLE_OPTIONS, entity);
    }
}
