import { AnyEntity } from '@mikro-orm/core/typings';
import { wrap } from '@mikro-orm/core';

type RelatedEntity = { id: string } & AnyEntity;

export class RelatedReference<T extends RelatedEntity> {
    constructor(private entity: T) {}

    get id() {
        return this.entity?.id;
    }

    async load(): Promise<T> {
        if (!this.isInitialized()) {
            //@TODO remove any in definition
            this.entity =
                ((await wrap(this.entity, true).__em.findOne(this.entity.constructor.name, this.id as any, {
                // The above solution is from Andrew's MR (advised by Alex)
                // TODO: validate that the solution is correct
                // Can be checked when there are two database connections
                // Database with entity that has related reference from another database should work.
                // ((await wrap(this.entity, true).__em.findOne(this.entity.constructor, this.entity.id, {
                    filters: false,
                })) as T) || undefined;
        }

        return this.entity;
    }

    getEntity(): T {
        if (!this.isInitialized()) {
            throw new Error('Entity has not been initialized');
        }

        return this.entity;
    }

    isInitialized(): boolean {
        return this.entity?.__helper?.__initialized;
    }

    toString() {
        return this.id;
    }

    static create<T extends RelatedEntity>(entity: T): RelatedReference<T> {
        return new RelatedReference(entity);
    }
}
