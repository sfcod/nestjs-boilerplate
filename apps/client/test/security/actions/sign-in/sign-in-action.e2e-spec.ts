import { HttpStatus } from '@nestjs/common';
import { MIKRO_ORM_DEFAULT, User, TwoFactorAuth } from '@libs/orm';
import { makeUser, Bootstrap } from '@libs/test';
import { EntityManagerResolver } from '@libs/orm-core';
import { JwtTokenHandler } from '@libs/security/strategy/jwt-token-handler';
import { Response } from 'supertest';

describe('UserSignIn (e2e)', () => {
    let userSms: User;
    let userEmail: User;
    let em: EntityManagerResolver;
    let tokenHandler: JwtTokenHandler;

    const PASSWORD = '123123';

    beforeAll(async () => {
        userSms = await makeUser(1, {
            plainPassword: PASSWORD,
            twoFactorAuth: TwoFactorAuth.SMS,
        } as any);

        userEmail = await makeUser(1, {
            plainPassword: PASSWORD,
            twoFactorAuth: TwoFactorAuth.EMAIL,
        } as any);

        em = Bootstrap.getEntityManager(MIKRO_ORM_DEFAULT);
        tokenHandler = await Bootstrap.resolve('AuthTokenHandler');
    });

    it('/api-client/auths/user (POST - User) - enabled 2FA SMS', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/auths/user').send({
            username: userSms.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).not.toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(false);
    });

    it('/api-client/auths/user (POST - User) - enabled 2FA Email', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/auths/user').send({
            username: userEmail.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).not.toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(false);
    });

    it('/api-client/auths/user (POST - User) - disabled 2FA', async () => {
        await em.nativeUpdate(User, { id: userSms.id }, { twoFactorAuth: null });

        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/auths/user').send({
            username: userSms.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(true);
    });
});
