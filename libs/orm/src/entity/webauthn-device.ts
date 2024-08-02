import { Cascade, Entity, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { User } from './user';
import { BinaryHexUuid } from '../extension/binary-hex-uuid';
import { WebauthnDeviceInterface } from '@libs/webauthn';

/**
 * Used to store webauthn device information (for webauthn authentication, like FaceID etc).
 *
 * See libs/webauthn.
 */
@Entity({
    tableName: 'webauthn_device',
})
export class WebauthnDevice implements WebauthnDeviceInterface {
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

    @Property({ fieldName: 'credential_id', type: 'text', index: true })
    credentialId: string;

    @Property({ fieldName: 'credential_public_key', type: 'text' })
    credentialPublicKey: string;

    @Property({ fieldName: 'counter', type: 'bigint' })
    counter: number;

    @Property({ fieldName: 'credential_device_type', type: 'string' })
    credentialDeviceType: WebauthnDeviceInterface['credentialDeviceType'];

    @Property({ fieldName: 'credential_backed_up', type: 'boolean' })
    credentialBackedUp: boolean;

    @Property({ fieldName: 'transports', type: 'array' })
    transports: WebauthnDeviceInterface['transports'] = [];

    /**
     * See the list of known AAGUIDs
     * @see https://raw.githubusercontent.com/passkeydeveloper/passkey-authenticator-aaguids/main/combined_aaguid.json
     */
    @Property({ fieldName: 'aaguid', type: 'string', nullable: true })
    aaguid: string | null;

    @Property({
        onCreate: () => getCurrentTimestamp,
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

    @Property({
        columnType: 'timestamp',
        fieldName: 'last_used_at',
        nullable: true,
    })
    lastUsedAt: Date | string | null = null;

    constructor(user: User) {
        this.user = Reference.create(user);
    }
}
