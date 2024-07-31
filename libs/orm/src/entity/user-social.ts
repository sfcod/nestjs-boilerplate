import { Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core';
import { BinaryHexUuid } from '../extension/binary-hex-uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { User } from './user';

/**
 * Used to store social login information.
 */
@Entity({
    tableName: 'user_social',
})
export class UserSocial {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = BinaryHexUuid.getBinaryHexUuid();

    @ManyToOne(() => User, {
        fieldName: 'user_id',
        onUpdateIntegrity: 'no action',
        ref: true,
        nullable: false,
    })
    user!: Ref<User>;

    @Property({ fieldName: 'provider' })
    provider!: string;

    @Property({ fieldName: 'social_user_id' })
    socialUserId!: string;

    @Property({ fieldName: 'token', nullable: true })
    token!: string;

    @Property({ fieldName: 'data', nullable: true })
    data!: string;

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
