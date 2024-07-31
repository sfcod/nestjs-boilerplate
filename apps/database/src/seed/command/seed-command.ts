import { Command, Console } from 'nestjs-console';
import { EntityManager } from '@mikro-orm/core';

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
        const args = [...command.args];

        if (!args.length) {
            args.push('');
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const seed of args) {
            //@TODO: refactor, should not use knex
            // console.log(
            //     await this.em.getKnex().seed.run({
            //         directory: __dirname + '/../script',
            //         specific: seed ? seed + '.js' : undefined,
            //         extension: 'js',
            //         loadExtensions: ['.js'],
            //     }),
            // );
        }
    }

    @Command({
        command: 'make <name>',
        options: [
            {
                flags: '--name',
                required: true,
            },
        ],
        description: 'Make a seed',
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async make(name: string): Promise<void> {
        //@TODO: refactor, should not use knex
        // console.log(
        //     name,
        //     await this.em.getKnex().seed.make(name, {
        //         directory: __dirname + '/../../../../database/seeds',
        //         extension: 'js',
        //         loadExtensions: ['.js'],
        //     }),
        // );
    }
}
