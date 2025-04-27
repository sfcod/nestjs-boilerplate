import {
    Cascade,
    Collection,
    Embedded,
    Entity,
    Enum,
    Filter,
    LoadStrategy,
    OneToMany,
    PrimaryKey,
    Property,
    raw,
} from '@mikro-orm/core';
import { AuthenticatorType, UserInterface, User2FAInterface } from '@libs/security';
import { File } from '@libs/file-uploader';
import { FILE_STORAGE_FILE_HELPER, FileHelper, UploadableField } from '@libs/file-storage';
import { Device } from './device';
import { UserAttribute } from './user-attribute';
import { UserSettings } from '../embeddable/user-settings';
import { v4 } from 'uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { TwoFactorAuth } from '../entity-enum/two-factor-auth';
import { UserRole } from '../entity-enum/user-role';

@Entity({
    tableName: 'user',
})
@Filter({
    name: 'email',
    cond: (args) => ({
        [raw('lower(email)')]: String(args.value).toLowerCase(),
    }),
})
@Filter({
    name: 'name',
    cond: (args) => ({
        "concat(first_name, ' ', last_name)": {
            $ilike: `%${args.value}%`,
        },
    }),
})
export class User implements UserInterface, User2FAInterface {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = v4();

    @Property({ fieldName: 'first_name', nullable: true })
    firstName!: string;

    @Property({ fieldName: 'last_name', nullable: true })
    lastName!: string;

    @Property({ fieldName: 'gender', nullable: true, length: 50 })
    gender: string;

    @Property({ fieldName: 'email', nullable: false })
    email!: string;

    @Property({ fieldName: 'status', type: 'smallint' })
    status!: number;

    @Property({ fieldName: 'password', nullable: true })
    password!: string;

    @Property({ fieldName: 'recovery_password_token', type: 'string', length: 255, nullable: true, unique: true })
    recoveryPasswordToken!: string;

    @Property({ fieldName: 'phone_number', columnType: 'VARCHAR', length: 50, nullable: true })
    phoneNumber: string;

    @Property({ fieldName: 'phone_verification_code', type: 'string', length: 6, nullable: true })
    phoneVerificationCode!: string;

    @Property({ fieldName: 'phone_verified', type: 'boolean', nullable: false, default: false })
    phoneVerified = false;

    @Property({ fieldName: 'email_verified', type: 'boolean', nullable: false, default: false })
    emailVerified = false;

    @Enum({ fieldName: 'two_factor_auth', items: TwoFactorAuth.getValues(), length: 50, nullable: true, default: null })
    twoFactorAuth: AuthenticatorType = null;

    @Embedded({ entity: () => UserSettings, object: true })
    settings = new UserSettings();

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

    @Property({
        columnType: 'bigint',
        fieldName: 'deleted_at',
        nullable: true,
    })
    deletedAt: number;

    @OneToMany({
        entity: 'Device',
        mappedBy: 'user',
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
        orphanRemoval: true,
        strategy: LoadStrategy.JOINED,
    })
    devices = new Collection<Device>(this);

    @OneToMany({
        entity: 'UserAttribute',
        mappedBy: 'user',
        cascade: [Cascade.PERSIST, Cascade.REMOVE],
        orphanRemoval: true,
        strategy: LoadStrategy.JOINED,
    })
    attributes = new Collection<UserAttribute>(this);

    private plainPassword!: string;

    getUuid(): any {
        return this.id;
    }

    getRoles(): string[] {
        return [UserRole.ROLE_USER];
    }

    getPassword(): string {
        return this.password;
    }

    getPlainPassword() {
        return this.plainPassword;
    }

    setPlainPassword(plainPassword: string) {
        this.plainPassword = plainPassword;

        if (plainPassword) {
            this.updatedAt = getCurrentTimestamp();
        }
    }

    getSalt(): string | null {
        return null;
    }

    getUsername(): string {
        return String(this.email);
    }

    getAuthenticatorIdentity(): string | null {
        switch (this.twoFactorAuth) {
            case TwoFactorAuth.SMS:
                return this.phoneNumber;
            case TwoFactorAuth.EMAIL:
                return this.email;
            default:
                return null;
        }
    }

    getAuthenticatorType(): AuthenticatorType {
        return this.twoFactorAuth;
    }
}
