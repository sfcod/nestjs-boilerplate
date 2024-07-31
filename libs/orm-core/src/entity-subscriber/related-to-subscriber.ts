import { EventArgs, EventSubscriber } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { RELATED_TO_ONE_METADATA_FIELD, RelatedToOneMetadata } from '../decorator/related-to-one.decorator';
import { RelatedReference } from '../extension/related-reference';
import { AnyEntity, EntityClass } from '@mikro-orm/core/typings';
import { OrmResolver } from '../service/orm-resolver';

@Injectable()
export class RelatedToSubscriber implements EventSubscriber {
    constructor(private ormResolver: OrmResolver) {
        for (const connection of this.ormResolver.getConnections()) {
            connection.em.getEventManager().registerSubscriber(this);
        }
    }

    isClass(v): v is EntityClass<any> {
        return typeof v === 'function' && /^\s*class\s+/.test(v.toString()) && !(v instanceof Array);
    }

    onInit({ entity }: EventArgs<AnyEntity>) {
        if (Reflect.hasMetadata(RELATED_TO_ONE_METADATA_FIELD, entity)) {
            const meta: RelatedToOneMetadata = Reflect.getMetadata(RELATED_TO_ONE_METADATA_FIELD, entity);
            Object.entries(meta).map(([field, opts]) => {
                const id = entity[field];

                let targetEntities = this.isClass(opts.entity)
                    ? opts.entity
                    : opts.entity instanceof Function && opts.entity(entity);

                if (!(targetEntities instanceof Array)) {
                    targetEntities = [targetEntities];
                }

                for (const targetEntity of targetEntities) {
                    const ref = this.processTargetEntity(targetEntity, id);
                    if (ref) {
                        entity[field] = ref;
                        break;
                    }
                }
            });
        }
    }

    processTargetEntity(targetEntity: EntityClass<any>, id: string | any): RelatedReference<any> | void {
        if (!(targetEntity instanceof RelatedReference) && id) {
            const instance = this.ormResolver
                .orm(targetEntity)
                .em.getEntityFactory()
                .create(targetEntity, { id }, { initialized: false, merge: true });

            if (instance) {
                return new RelatedReference(instance);
            }
        }
    }
}
