import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { FlushEventArgs } from '@mikro-orm/core/events/EventSubscriber';
import { SOFT_DELETABLE_OPTIONS, SoftDeletableOptions } from '../decorator/soft-deletable.decorator';
import { AnyEntity } from '@mikro-orm/core/typings';
import { Collection, Reference, UnitOfWork } from '@mikro-orm/core';

@Injectable()
export class RestoreSubscriber {
    constructor(private readonly em: EntityManager) {
        em.getEventManager().registerSubscriber(this);
    }

    async beforeFlush({ uow }: FlushEventArgs): Promise<void> {
        const persistStack: Set<AnyEntity> = uow.getPersistStack();

        for (const entity of persistStack) {
            if (Reflect.hasMetadata(SOFT_DELETABLE_OPTIONS, entity)) {
                const { fieldName } = this.getDecoratorOptions(entity);

                if (!entity.__meta.properties.hasOwnProperty(fieldName)) {
                    throw new Error("RestoreSubscriber: object doesn't have field");
                }

                const originalEntity = uow.getOriginalEntityData(entity);
                const wasRestored = !!originalEntity && !entity?.[fieldName] && !!originalEntity[fieldName];
                if (!wasRestored) {
                    continue;
                }

                const groupValue = originalEntity[fieldName];
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
                            this.processRelation(item, groupValue, uow);
                        }
                    } else {
                        this.processRelation(reference, groupValue, uow);
                    }
                }
            }
        }
    }

    private processRelation(entity: AnyEntity, groupValue: number | string, uow: UnitOfWork) {
        if (!Reflect.hasMetadata(SOFT_DELETABLE_OPTIONS, entity)) {
            return;
        }

        const { fieldName }: SoftDeletableOptions = this.getDecoratorOptions(entity);
        if (!entity?.[fieldName] || entity?.[fieldName] !== groupValue) {
            // It wasn't deleted or it was deleted separately to main entity
            return;
        }

        const persistStack: Set<AnyEntity> = uow.getPersistStack();
        if (persistStack.has(entity)) {
            // We need to put it in the end of persist stack to check it's dependencies later.
            // Maybe we need to restore something depended on it.
            persistStack.delete(entity);
        }

        entity[fieldName] = null;
        uow.persist(entity);
    }

    private getDecoratorOptions(entity: AnyEntity): SoftDeletableOptions | undefined {
        return Reflect.getMetadata(SOFT_DELETABLE_OPTIONS, entity);
    }
}
