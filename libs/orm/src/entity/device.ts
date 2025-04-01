import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference, Unique } from '@mikro-orm/core';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { BinaryHexUuid } from '../extension/binary-hex-uuid';
import { User } from './user';

@Entity({
    tableName: 'device',
})
@Unique({ properties: ['user', 'uniqueId'] })
export class Device {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = BinaryHexUuid.getBinaryHexUuid();

    @ManyToOne(() => User, {
        fieldName: 'owner_id',
        deleteRule: 'cascade',
        updateRule: 'no action',
        nullable: false,
        ref: true,
    })
    user!: Ref<User>;

    @Property({ fieldName: 'unique_id' })
    uniqueId!: string;

    @Property({ fieldName: 'token' })
    token!: string;

    @Property({ fieldName: 'os' })
    os!: string;

    @Property({
        onCreate: () => getCurrentTimestamp(),
        columnType: 'timestamp',
        fieldName: 'created_at',
    })
    createdAt: Date | string;

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
