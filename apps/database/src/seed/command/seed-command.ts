import { Command, Console } from 'nestjs-console';
import { EntityManager, wrap } from '@mikro-orm/core';
import { Admin, AdminStatus } from '@libs/orm';
import { hash } from 'bcrypt';
import { v4 } from 'uuid';

@Console({
    command: 'seed',
    description: 'A command to create users',
})
export class SeedCommand {
    constructor(private readonly em: EntityManager) {}

    @Command({
        command: 'run',
        description: 'Run seeds',
    })
    async run(command: any): Promise<void> {
        const em = this.em.fork();
        const admin = new Admin();
        wrap(admin).assign(
            {
                id: v4(),
                email: 'admin@mail.com',
                name: 'Admin',
                phoneVerified: true,
                status: AdminStatus.STATUS_ACTIVE,
                password: await hash(String('123123'), parseInt(admin.getSalt() || '10')),
            },
            { em },
        );
        await em.persist(admin).flush();
    }
}
