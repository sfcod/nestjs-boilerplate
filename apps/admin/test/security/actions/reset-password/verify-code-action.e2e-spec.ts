import { HttpStatus } from '@nestjs/common';
import { makeAdmin, Bootstrap } from '@libs/test';
import { Admin } from '@libs/orm';
import { Response } from 'supertest';

describe('VerifyCodeAction (e2e)', () => {
    let user: Admin;

    beforeAll(async () => {
        user = await makeAdmin(1, {
            recoveryPasswordToken: '123123',
        });
    });

    it('/api-admin/users/verify-reset-password-code (POST - Admin)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-client/users/verify-reset-password-code')
            .send({
                code: user.recoveryPasswordToken,
            });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
    });
});
