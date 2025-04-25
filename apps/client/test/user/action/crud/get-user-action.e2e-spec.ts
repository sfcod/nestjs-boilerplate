import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import { User } from '@libs/orm';
import { authToken, Bootstrap, makeUser } from '@libs/test';

describe('GetUser (e2e)', () => {
    let jwtToken: string;
    let user: User;

    beforeAll(async () => {
        user = await makeUser(1);
        jwtToken = await authToken(user);
    });

    it('/api-client/users/{id} (GET)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .get(`/api-client/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(HttpStatus.OK);
        expect(res.body.email).toBe(user.email);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'id',
                'email',
                'name',
                'firstName',
                'lastName',
                'gender',
                'phoneNumber',
                'status',
                'createdAt',
                'updatedAt',
            ]),
        );
    });
});
