import { HttpStatus } from '@nestjs/common';
import { makeUser, Bootstrap } from '@libs/test';
import { User } from '@libs/orm';
import { Response } from 'supertest';

describe('VerifyCodeAction (e2e)', () => {
    let user: User;

    beforeAll(async () => {
        user = await makeUser(1, {
            recoveryPasswordToken: '123123',
        });
    });

    it('/api-client/users/verify-reset-password-code (POST - User)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-client/users/verify-reset-password-code')
            .send({
                code: user.recoveryPasswordToken,
            });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
    });
});
