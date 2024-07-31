import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import { Bootstrap, makeAdmin, refreshToken } from '@libs/test';
import { Admin } from '@libs/orm';

describe('UserRefreshTokenAction (e2e)', () => {
    let user: Admin;
    let jwtRefreshToken: string;

    beforeAll(async () => {
        user = await makeAdmin(1);

        jwtRefreshToken = await refreshToken(user);
    });

    it('/api-admin/auths/refresh (POST - User)', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-admin/auths/refresh').send({
            refreshToken: jwtRefreshToken,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).not.toBeNull();
        expect(res.body.refreshToken).not.toBeNull();
    });
});
