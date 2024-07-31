import { Bootstrap } from './bootstrap';
import { SignerBuilder, UserInterface } from '@libs/security';
import { INestApplication } from '@nestjs/common';
import { EntityManagerResolver, OrmResolver } from '@libs/orm-core';
import { SqlEntityManager } from '@mikro-orm/knex';
import { AccessKey, truncateAll as truncateSql } from '@libs/orm';
import { AccessKeyManager, GeneratedData } from '@libs/access-key';
import { makeAccessKey } from './access-key';
import { hash } from 'bcrypt';

export async function makeData<T>(
    count = 1,
    fields: Partial<T>,
    processor: (fields: Partial<T>, emr: EntityManagerResolver, i: number) => Promise<T>,
): Promise<T | T[]> {
    const emr = Bootstrap.get<EntityManagerResolver>(EntityManagerResolver);
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

    await emr
        .getEntityManager(objects[0] as any)
        .fork({ clear: true, useContext: false, freshEventManager: true })
        .persistAndFlush(objects);

    return count === 1 ? (objects[0] as T) : objects;
}

export async function truncateTables(app?: INestApplication) {
    const resolver = app ? app.get(OrmResolver) : Bootstrap.get(OrmResolver);
    for (const connection of resolver.getConnections()) {
        await truncateSql(connection.em as SqlEntityManager);
    }
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

export async function accessKeys(permission: string): Promise<{ generatedKey: GeneratedData; accessKey: AccessKey }> {
    const generatedKey = await Bootstrap.get<AccessKeyManager>(AccessKeyManager).generate();
    const accessKey = await makeAccessKey(1, {
        key: generatedKey.hashedKey,
        permissions: [permission],
    });

    return { generatedKey, accessKey };
}

function isUserInterface(entity: any): entity is UserInterface & { password: string } {
    return 'getPlainPassword' in entity && 'getSalt' in entity;
}
