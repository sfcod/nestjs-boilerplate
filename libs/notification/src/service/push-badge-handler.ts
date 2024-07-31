import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
// import { PushBadge } from '@libs/orm';

@Injectable()
export class PushBadgeHandler {
    public constructor(private readonly em: EntityManager) {}

    public async handle(user: User | string, increment = true): Promise<any> {
        // if (typeof user === 'string') {
        //     user = await this.em.getRepository(User).findOne({ id: user });
        // }
        //
        // let pushBadge = await this.em.getRepository(PushBadge).findOne({ user });
        //
        // if (!pushBadge) {
        //     pushBadge = new PushBadge(user as UserPatient | UserDoctor);
        //     pushBadge.badge = 0;
        // }
        //
        // if (increment) {
        //     pushBadge.badge += 1;
        // }
        //
        // await this.em.persistAndFlush(pushBadge);
        //
        // return pushBadge;
    }
}
