import { Entity, Filter, ManyToOne, PrimaryKey, Property, Ref, Reference } from '@mikro-orm/core';
import { getCurrentTimestamp } from '../helper/date-type.helper';
import { v4 } from 'uuid';
import { User } from './user';

@Entity({
    tableName: 'notification',
})
@Filter({
    name: 'search',
    cond: ({ value }) => ({
        "concat(title, ' ', message)": {
            $ilike: `%${value}%`,
        },
    }),
})
export class Notification {
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

    @Property({ fieldName: 'type', type: 'smallint' })
    type!: number;

    @Property({ fieldName: 'status', type: 'smallint', default: 0 })
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

    @Property({ fieldName: 'title', nullable: true })
    title!: string;

    @Property({ fieldName: 'message', type: 'text', nullable: true })
    message!: string;

    @Property({ fieldName: 'data', type: 'text', default: '{}' })
    private data!: string;

    constructor(user: User) {
        this.user = Reference.create(user);
    }

    getData(): any {
        return JSON.parse(this.data);
    }

    setData(data: any = {}): Notification {
        this.data = JSON.stringify(data);

        return this;
    }
}
