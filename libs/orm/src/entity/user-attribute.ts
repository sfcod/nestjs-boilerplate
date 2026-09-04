import { Ref, Reference } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { v4 } from 'uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { User } from './user';

@Entity({
    tableName: 'user_attribute',
})
@Unique({ properties: ['user', 'name'] })
export class UserAttribute<T = any> {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = v4();

    @ManyToOne(() => User, {
        fieldName: 'user_id',
        deleteRule: 'cascade',
        updateRule: 'no action',
        nullable: false,
        ref: true,
    })
    user!: Ref<User>;

    @Property({ fieldName: 'name', type: 'string', nullable: false })
    name!: string;

    @Property({ fieldName: 'value', type: 'json', nullable: true })
    value!: T;

    @Property({
        onCreate: () => getCurrentTimestamp(),
        onUpdate: () => getCurrentTimestamp(),
        columnType: 'timestamp',
        fieldName: 'updated_at',
        type: 'string',
        runtimeType: 'string',
    })
    updatedAt: Date | string;

    constructor(user: User) {
        this.user = Reference.create(user);
    }
}
