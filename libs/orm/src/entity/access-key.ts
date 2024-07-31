import {
    Cascade,
    Collection,
    Entity,
    Filter,
    ManyToOne,
    OneToMany,
    PrimaryKey,
    Property,
    Ref,
    Reference,
} from '@mikro-orm/core';
import { BinaryHexUuid } from '../extension/binary-hex-uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { AccessKeyStatus } from '../entity-enum/access-key-status';
import { AccessKeyPermission } from './access-key-permission';
import { Admin } from './admin';

/**
 * Used to access api endpoints using access key instead of jwt token.
 *
 * Example of usage in controller:
 *
 * ```typescript
 * @Get()
 * @UseGuards(AuthGuard(['api-access-key']), AccessKeyGuard(AccessPermission.SOME_PERMISSION))
 * ```
 *
 */
@Entity({
    tableName: 'access_key',
})
@Filter({
    name: 'owner',
    cond: (args) => ({
        owner: args.ownerId,
    }),
})
export class AccessKey {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = BinaryHexUuid.getBinaryHexUuid();

    @Property({ fieldName: 'name', nullable: true })
    name!: string;

    @Property({ fieldName: 'key', type: 'string' })
    key!: string;

    @Property({ fieldName: 'salt', type: 'string' })
    salt!: string;

    @ManyToOne(() => Admin, {
        fieldName: 'owner_id',
        onDelete: 'no action',
        onUpdateIntegrity: 'no action',
        ref: true,
        nullable: false,
    })
    owner: Ref<Admin>;

    @Property({ fieldName: 'status', type: 'smallint' })
    status!: number;

    @OneToMany({
        entity: 'AccessKeyPermission',
        mappedBy: 'accessKey',
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
        orphanRemoval: true,
    })
    permissions = new Collection<AccessKeyPermission>(this);

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

    constructor(owner: Admin) {
        this.owner = Reference.create(owner);
        this.status = AccessKeyStatus.STATUS_ACTIVE;
    }

    public async getPermissions(): Promise<string[]> {
        if (!this.permissions) {
            return [];
        }

        if (!this.permissions.isInitialized()) {
            await this.permissions.init();
        }

        return this.permissions.getItems().map(({ permission }) => permission);
    }

    public setPermissions(permissions: string[]) {
        const permissionNames = [];
        // Remove items
        this.permissions.getItems().forEach((keyPermission) => {
            permissionNames.push(keyPermission.permission);

            if (!permissions.includes(keyPermission.permission)) {
                this.permissions.remove(keyPermission);
            }
        });

        // Add new items
        permissions.forEach((keyPermission) => {
            if (!permissionNames.includes(keyPermission)) {
                const accessKeyPermission = new AccessKeyPermission(this);
                accessKeyPermission.permission = keyPermission;

                this.permissions.add(accessKeyPermission);
            }
        });
    }
}
