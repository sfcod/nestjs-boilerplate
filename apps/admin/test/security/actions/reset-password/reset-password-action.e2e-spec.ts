import { HttpStatus } from '@nestjs/common';
import { Bootstrap, makeAdmin } from '@libs/test';
import { Admin } from '@libs/orm';
import { Response } from 'supertest';

describe('ResetPasswordAction (e2e)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let user: Admin;

    beforeAll(async () => {
        user = await makeAdmin(1);
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-admin/users/reset-password (POST - User)', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-admin/users/reset-password').send({
            email: user.email,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
    });
});
