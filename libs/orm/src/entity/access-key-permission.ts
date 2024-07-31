import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core';
import { BinaryHexUuid } from '../extension/binary-hex-uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { AccessKey } from './access-key';

@Entity({
    tableName: 'access_key_permission',
})
export class AccessKeyPermission {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = BinaryHexUuid.getBinaryHexUuid();

    @ManyToOne(() => AccessKey, {
        fieldName: 'access_key_id',
        onDelete: 'cascade',
        onUpdateIntegrity: 'no action',
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
