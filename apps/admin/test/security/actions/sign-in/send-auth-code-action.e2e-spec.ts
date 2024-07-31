import { Admin, TwoFactorAuth } from '@libs/orm';
import { authToken, makeAdmin } from '@libs/test';
import { Bootstrap } from '@libs/test';
import { createStubInstance, stub } from 'sinon';
import { Test, TestingModule } from '@nestjs/testing';
import { SmsSender } from '@libs/twilio';
import { Response } from 'supertest';
import { AdminPanelModule } from '@app/admin/admin-panel.module';
import { Mailer } from '@libs/mailer';

describe('SendAuthCode (e2e)', () => {
    let userSms: Admin;
    let userMail: Admin;
    let sentUserPhone: string;
    let sentUserMail: string;
    let token: any;

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

        userSms = await makeAdmin(1, { twoFactorAuth: TwoFactorAuth.SMS, plainPassword: PASSWORD });
        userMail = await makeAdmin(1, { twoFactorAuth: TwoFactorAuth.EMAIL, plainPassword: PASSWORD });
        token = await authToken(userSms, true);
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-admin/auths/send-code (POST - Sms)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-admin/auths/send-code')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.statusCode).toBe(204);
        expect(sentUserPhone).toBe(userSms.phoneNumber);
    });

    it('/api-admin/auths/send-code - test sms throttle (must be 429 error response)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-admin/auths/send-code')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.statusCode).toBe(429);
    });

    it('/api-admin/auths/send-code - test sms throttle (throttle should be reset after new login)', async () => {
        const signInRes: Response = await Bootstrap.getHttpRequest().post('/api-admin/auths/admin').send({
            username: userSms.email,
            password: PASSWORD,
        });
        expect(signInRes.statusCode).toBe(201);
        expect(signInRes.body.token).not.toBeNull();

        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-admin/auths/send-code')
            .set('Authorization', `Bearer ${signInRes.body.token}`)
            .send();

        expect(res.statusCode).toBe(204);
    });

    it('/api-admin/auths/send-code (POST - Mail)', async () => {
        const token = await authToken(userMail, true);
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-admin/auths/send-code')
            .set('Authorization', `Bearer ${token}`)
            .send();

        expect(res.statusCode).toBe(204);
        expect(sentUserMail).toBe(userMail.email);
    });
});
