import { EntityManager, EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '@libs/orm';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';

@Injectable()
export class UserPhoneVerifiedSubscriber implements EventSubscriber<User> {
    constructor(private readonly em: EntityManager) {
        em.getEventManager().registerSubscriber(this);
    }

    getSubscribedEntities(): EntityName<User>[] {
        return [User];
    }

    async afterUpdate(args: EventArgs<User>): Promise<void> {
        if (args.changeSet.payload.phoneNumber) {
            const user = await this.em.findOne(User, args.entity.id, {
                filters: { [SOFT_DELETABLE_QUERY_FILTER]: false },
            });

            // we cant update user using UoW, but still need to set clinic property for correct response
            user.phoneVerified = false;

            await args.em.nativeUpdate(
                User,
                { id: user.id },
                { phoneVerified: false },
                { filters: { [SOFT_DELETABLE_QUERY_FILTER]: false } },
            );
        }
    }
}
