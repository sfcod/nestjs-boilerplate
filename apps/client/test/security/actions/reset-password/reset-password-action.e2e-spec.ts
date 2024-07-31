import { HttpStatus } from '@nestjs/common';
import { Bootstrap, makeUser } from '@libs/test';
import { User } from '@libs/orm';
import { Response } from 'supertest';

describe('ResetPasswordAction (e2e)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let user: User;

    beforeAll(async () => {
        user = await makeUser(1);
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-client/users/reset-password (POST - User)', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/users/reset-password').send({
            email: user.email,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
    });
});
