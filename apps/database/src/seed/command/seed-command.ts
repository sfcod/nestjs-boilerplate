import { Command, Console } from 'nestjs-console';
import { wrap } from '@mikro-orm/core';
import { Admin, AdminStatus, BinaryHexUuid } from '@libs/orm';
import { EntityManagerResolver } from '@libs/orm-core';
import { hash } from 'bcrypt';

@Console({
    command: 'seed',
    description: 'A command to create users',
})
export class SeedCommand {
    constructor(private readonly emResolver: EntityManagerResolver) {}

    @Command({
        command: 'run',
        description: 'Run seeds',
    })
    async run(command: any): Promise<void> {
        const em = this.emResolver.getEntityManager(Admin).fork();
        const admin = new Admin();
        wrap(admin).assign(
            {
                id: BinaryHexUuid.getBinaryHexUuid(),
                email: 'admin@mail.com',
                name: 'Admin',
                phoneVerified: true,
                status: AdminStatus.STATUS_ACTIVE,
                password: await hash(String('123123'), parseInt(admin.getSalt() || '10')),
            },
            { em },
        );
        await em.persistAndFlush(admin);
    }
}
