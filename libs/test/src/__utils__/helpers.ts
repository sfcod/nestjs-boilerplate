import { Bootstrap } from './bootstrap';
import { SignerBuilder, UserInterface } from '@libs/security';
import { INestApplication } from '@nestjs/common';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { SqlEntityManager } from '@mikro-orm/sql';
import { truncateAll as truncateSql } from '@libs/orm';
import { hash } from 'bcrypt';

export async function makeData<T>(
    count = 1,
    fields: Partial<T>,
    processor: (fields: Partial<T>, emr: EntityManager, i: number) => Promise<T>,
): Promise<T | T[]> {
    const emr = Bootstrap.get<EntityManager>(EntityManager);
    const objects: T[] = [];

    for (let i = 0; i < count; i++) {
        const entity = await processor(fields, emr, i);

        Object.keys(fields || {}).map((key) => {
            entity[key] = fields[key];
        });

        if (isUserInterface(entity) && entity.getPlainPassword()) {
            entity.password = await hash(String(entity.getPlainPassword()), parseInt(entity.getSalt() || '10'));
        }

        objects.push(entity);
    }

    const em = emr.fork({ clear: true, useContext: false, freshEventManager: true });
    em.persist(objects);
    await em.flush();

    return count === 1 ? (objects[0] as T) : objects;
}

export async function truncateTables(app?: INestApplication) {
    const orm = app ? app.get(MikroORM) : Bootstrap.get(MikroORM);
    await truncateSql(orm.em as unknown as SqlEntityManager);
}

export async function authToken(user: any, signGuest = false): Promise<string> {
    const signBuilder: SignerBuilder = await Bootstrap.resolve(SignerBuilder);
    const signer = signGuest ? await signBuilder.getGuestSigner() : await signBuilder.getSigner();

    return (await signer.sign(user)).token;
}

export async function refreshToken(user: any): Promise<string> {
    const signBuilder: SignerBuilder = await Bootstrap.resolve(SignerBuilder);
    const signer = await signBuilder.getSigner();

    return (await signer.sign(user)).refreshToken;
}

function isUserInterface(entity: any): entity is UserInterface & { password: string } {
    return 'getPlainPassword' in entity && 'getSalt' in entity;
}
