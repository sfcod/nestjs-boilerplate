import { faker } from '@faker-js/faker';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import { User } from '@libs/orm';
import { authToken, Bootstrap, makeUser } from '@libs/test';
import { join } from 'path';
import { path as appRoot } from 'app-root-path';

describe('UpdateUser (e2e)', () => {
    let jwtToken: string;
    let user: User;

    const FIRSTNAME = faker.person.firstName();

    beforeAll(async () => {
        user = await makeUser(1);
        jwtToken = await authToken(user);
    });

    it('/api-client/users/{id} (PATCH)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .patch(`/api-client/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .set('Content-Type', 'application/json')
            .send({
                firstName: FIRSTNAME,
            });

        expect(res.statusCode).toBe(HttpStatus.OK);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'id',
                'email',
                'firstName',
                'lastName',
                'gender',
                'phoneNumber',
                'status',
                'createdAt',
                'updatedAt',
            ]),
        );
        expect(res.body).toEqual(
            expect.objectContaining({
                id: user.id,
                firstName: FIRSTNAME,
                email: user.email,
                status: user.status,
                phoneNumber: user.phoneNumber,
            }),
        );
    });
});
