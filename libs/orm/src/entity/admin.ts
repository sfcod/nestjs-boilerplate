import { Entity, Enum, Filter, PrimaryKey, Property, raw } from '@mikro-orm/core';
import { AuthenticatorType, User2FAInterface, UserInterface } from '@libs/security';
import { v4 } from 'uuid';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { TwoFactorAuth } from '../entity-enum/two-factor-auth';
import { AdminRole } from '../entity-enum/admin-role';

@Entity({
    tableName: 'admin',
})
@Filter({
    name: 'email',
    cond: (args) => ({
        [raw('lower(email)')]: String(args.value).toLowerCase(),
    }),
})
export class Admin implements UserInterface, User2FAInterface {
    @PrimaryKey({ fieldName: 'id', type: 'uuid' })
    readonly id = v4();

    @Property({ fieldName: 'name', nullable: true })
    name!: string;

    @Property({ fieldName: 'email' })
    email!: string;

    @Property({ fieldName: 'phone_number', columnType: 'VARCHAR', length: 50, nullable: true })
    phoneNumber!: string;

    @Property({ fieldName: 'phone_verification_code', type: 'string', length: 6, nullable: true })
    phoneVerificationCode!: string;

    @Property({ fieldName: 'phone_verified', type: 'boolean', nullable: false, default: false })
    phoneVerified = false;

    @Enum({ fieldName: 'two_factor_auth', items: TwoFactorAuth.getValues(), length: 50, nullable: true, default: null })
    twoFactorAuth: AuthenticatorType | null = null;

    @Property({ fieldName: 'roles' })
    roles!: string;

    @Property({ fieldName: 'password' })
    password!: string;

    @Property({ fieldName: 'recovery_password_token', type: 'string', length: 255, nullable: true })
    recoveryPasswordToken!: string;

    @Property({ fieldName: 'status', type: 'smallint' })
    status!: number;

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

    private plainPassword!: string;

    constructor() {
        this.setRoles([AdminRole.ROLE_SYSTEM_ADMIN]);
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

    getUuid(): any {
        return this.id;
    }

    getRoles(): string[] {
        return JSON.parse(this.roles);
    }

    setRoles(roles: string[]): Admin {
        this.roles = JSON.stringify(roles);
        return this;
    }

    getPassword(): string {
        return this.password;
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
