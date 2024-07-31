import { HttpStatus } from '@nestjs/common';
import { MIKRO_ORM_DEFAULT, User } from '@libs/orm';
import { makeUser, Bootstrap } from '@libs/test';
import { EntityManagerResolver } from '@libs/orm-core';
import { JwtTokenHandler } from '@libs/security/strategy/jwt-token-handler';
import { Response } from 'supertest';

describe('AdminSignIn (e2e)', () => {
    let user: User;
    let em: EntityManagerResolver;
    let tokenHandler: JwtTokenHandler;

    const PASSWORD = '123123';

    beforeAll(async () => {
        user = await makeUser(1, {
            plainPassword: PASSWORD,
        } as any);

        em = Bootstrap.getEntityManager(MIKRO_ORM_DEFAULT);
        tokenHandler = await Bootstrap.resolve('AuthTokenHandler');
    });

    it('/api-client/auths/user (POST - Patient) - enabled 2FA', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/auths/user').send({
            username: user.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).not.toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(false);
    });

    it('/api-client/auths/user (POST - Patient) - disabled 2FA', async () => {
        await em.nativeUpdate(User, { id: user.id }, { twoFactorAuth: null });

        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/auths/user').send({
            username: user.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(true);
    });
});
