import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { AccessKey } from './access-key';
import { v4 } from 'uuid';

@Entity({
    tableName: 'access_key_permission',
})
export class AccessKeyPermission {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = v4();

    @ManyToOne(() => AccessKey, {
        fieldName: 'access_key_id',
        deleteRule: 'cascade',
        updateRule: 'no action',
        ref: true,
        nullable: false,
    })
    accessKey: Ref<AccessKey>;

    @Property({ fieldName: 'permission', nullable: false })
    permission!: string;

    @Property({
        onCreate: () => getCurrentTimestamp(),
        columnType: 'timestamp',
        fieldName: 'created_at',
    })
    createdAt: Date | string;

    constructor(accessKey: AccessKey) {
        this.accessKey = Reference.create(accessKey);
    }
}
