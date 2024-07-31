import { HttpStatus } from '@nestjs/common';
import { MIKRO_ORM_DEFAULT, Admin, TwoFactorAuth } from '@libs/orm';
import { makeAdmin, Bootstrap } from '@libs/test';
import { EntityManagerResolver } from '@libs/orm-core';
import { JwtTokenHandler } from '@libs/security/strategy/jwt-token-handler';
import { Response } from 'supertest';
import { createStubInstance, stub } from 'sinon';
import { SmsSender } from '@libs/twilio';
import { Mailer } from '@libs/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminPanelModule } from '@app/admin/admin-panel.module';

describe('AdminSignIn (e2e)', () => {
    let userSms: Admin;
    let userEmail: Admin;
    let em: EntityManagerResolver;
    let tokenHandler: JwtTokenHandler;
    let sentUserPhone: string;
    let sentUserMail: string;

    const PASSWORD = '123123';

    const smsSender = createStubInstance(SmsSender, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        send: stub().callsFake(({ to }) => {
            sentUserPhone = to;
        }),
    });

    const mailer = createStubInstance(Mailer, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        sendMail: stub().callsFake(({ to }) => {
            sentUserMail = to;
        }),
    });

    beforeAll(async () => {
        const fakeModule: TestingModule = await Test.createTestingModule({
            imports: [AdminPanelModule],
        })
            .overrideProvider(SmsSender)
            .useValue(smsSender)
            .overrideProvider('SmsSender')
            .useValue(smsSender)
            .overrideProvider(Mailer)
            .useValue(mailer)
            .compile();

        await Bootstrap.setup(
            { module: AdminPanelModule },
            {
                instance: fakeModule,
                instanceClass: AdminPanelModule,
            },
        );
        userSms = await makeAdmin(1, {
            plainPassword: PASSWORD,
            twoFactorAuth: TwoFactorAuth.SMS,
        } as any);

        userEmail = await makeAdmin(1, {
            plainPassword: PASSWORD,
            twoFactorAuth: TwoFactorAuth.EMAIL,
        } as any);

        em = Bootstrap.getEntityManager(MIKRO_ORM_DEFAULT);
        tokenHandler = await Bootstrap.resolve('AuthTokenHandler');
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-admin/auths/user (POST - User) - enabled 2FA SMS', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-admin/auths/user').send({
            username: userSms.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).not.toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(false);
        expect(sentUserPhone).toBe(userSms.phoneNumber);
    });

    it('/api-admin/auths/user (POST - User) - enabled 2FA Email', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-admin/auths/user').send({
            username: userEmail.email,
            password: PASSWORD,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).not.toBeTruthy();

        const payload = await tokenHandler.decode(res.body.token);
        expect(payload.fullyAuthenticated).toBe(false);
        expect(sentUserMail).toBe(userEmail.email);
    });

    it('/api-admin/auths/user (POST - User) - disabled 2FA', async () => {
        await em.nativeUpdate(Admin, { id: userSms.id }, { twoFactorAuth: null });

        const res: Response = await Bootstrap.getHttpRequest().post('/api-admin/auths/user').send({
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
