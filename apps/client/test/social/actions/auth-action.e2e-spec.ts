import { faker } from '@faker-js/faker';
import { Response } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleProvider } from '@app/client/social/service/provider/google-provider';
import { Bootstrap, makeUser, makeUserSocial, truncateTables } from '@libs/test';
import { ClientModule } from '@app/client/client.module';
import { HttpStatus } from '@nestjs/common';

describe('SocialAuth (e2e)', () => {
    const ID = faker.string.uuid();
    const EMAIL = faker.internet.email();
    const googleProvider = {
        getProvider(): string {
            return 'google';
        },
        async verify() {
            return {
                id: ID,
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                name: faker.person.fullName(),
                email: EMAIL,
                provider: 'google',
            };
        },
    };

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        const fakeModule: TestingModule = await Test.createTestingModule({
            imports: [ClientModule],
        })
            .overrideProvider(GoogleProvider)
            .useValue(googleProvider)
            .compile();
        await Bootstrap.setup(
            { module: ClientModule },
            {
                instance: fakeModule,
                instanceClass: ClientModule,
            },
        );
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    test('Test authToken', async () => {
        await makeUserSocial(1, {
            user: await makeUser(1, {
                email: EMAIL,
            }),
            socialUserId: ID,
        });

        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/socials/auth').send({
            token: faker.string.uuid(),
            secret: faker.string.uuid(),
            id: ID,
            provider: 'google',
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).not.toBeNull();
        expect(res.body.refreshToken).not.toBeNull();
    });

    test('Test sign-up', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/socials/auth').send({
            token: faker.string.uuid(),
            secret: faker.string.uuid(),
            id: ID,
            provider: 'google',
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).not.toBeNull();
        expect(res.body.refreshToken).not.toBeNull();
    });
});
