import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import { Bootstrap, makeUser, refreshToken } from '@libs/test';
import { User } from '@libs/orm';

describe('UserRefreshTokenAction (e2e)', () => {
    let user: User;
    let jwtRefreshToken: string;

    beforeAll(async () => {
        user = await makeUser(1);

        jwtRefreshToken = await refreshToken(user);
    });

    it('/api-client/auths/refresh (POST - User)', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/auths/refresh').send({
            refreshToken: jwtRefreshToken,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).not.toBeNull();
        expect(res.body.refreshToken).not.toBeNull();
    });
});
