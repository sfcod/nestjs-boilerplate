import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { hash } from 'bcrypt';
import { Admin, User } from '@libs/orm';
import { Injectable } from '@nestjs/common';
import { OrmResolver } from '@libs/orm-core';

type Entities = Admin | User;

@Injectable()
export class PasswordSubscriber implements EventSubscriber<Entities> {
    constructor(private ormResolver: OrmResolver) {
        for (const connection of this.ormResolver.getConnections()) {
            connection.em.getEventManager().registerSubscriber(this);
        }
    }

    getSubscribedEntities(): EntityName<Entities>[] {
        return [Admin, User];
    }

    async beforeCreate(args: EventArgs<Entities>): Promise<void> {
        await this.makePassword(args.entity);
    }

    async beforeUpdate(args: EventArgs<Entities>): Promise<void> {
        await this.makePassword(args.entity);
    }

    private async makePassword(entity: Entities): Promise<void> {
        if (entity.getPlainPassword()) {
            entity.password = await hash(String(entity.getPlainPassword()), parseInt(entity.getSalt() || '10'));
        }
    }

    async afterUpdate(args: EventArgs<Entities>): Promise<void> {
        await this.clearPassword(args.entity);
    }

    async afterCreate(args: EventArgs<Entities>): Promise<void> {
        await this.clearPassword(args.entity);
    }

    private async clearPassword(entity: Entities): Promise<void> {
        if (entity.getPlainPassword()) {
            entity.setPlainPassword(null);
        }
    }
}
