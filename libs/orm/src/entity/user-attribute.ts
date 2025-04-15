import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference, Unique } from '@mikro-orm/core';
import { BinaryHexUuid } from '../extension/binary-hex-uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { User } from './user';

@Entity({
    tableName: 'user_attribute',
})
@Unique({ properties: ['user', 'name'] })
export class UserAttribute<T = any> {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = BinaryHexUuid.getBinaryHexUuid();

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
    })
    updatedAt: Date | string;

    constructor(user: User) {
        this.user = Reference.create(user);
    }
}
