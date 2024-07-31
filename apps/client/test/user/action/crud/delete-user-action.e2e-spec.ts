import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import { User } from '@libs/orm';
import { authToken, Bootstrap, makeUser } from '@libs/test';

describe('DeleteUser (e2e)', () => {
    let jwtToken: string;
    let user: User;

    beforeAll(async () => {
        user = await makeUser(1);
        jwtToken = await authToken(user);
    });

    it('/api-client/users/{id} (DELETE)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .delete(`/api-client/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(HttpStatus.NO_CONTENT);
    });
});
