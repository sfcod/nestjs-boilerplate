import { User, TwoFactorAuth } from '@libs/orm';
import { authToken, Bootstrap, makeUser } from '@libs/test';
import { ClientModule } from '@app/client/client.module';
import { createStubInstance, stub } from 'sinon';
import { Test, TestingModule } from '@nestjs/testing';
import { SmsCodeAuthenticator } from '@libs/security';
import { faker } from '@faker-js/faker';
import { Response } from 'supertest';
import { EmailCodeAuthenticator } from '@libs/security/service/authenticator/email-code-authenticator';

describe('VerifyAuthCode (e2e)', () => {
    let userSms: User;
    let userEmail: User;
    const code = faker.number.int({ min: 1000, max: 9999 }) + '';

    const smsAuthenticator = createStubInstance(SmsCodeAuthenticator, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        verify: stub().callsFake((verifyCode) => {
            return verifyCode === code;
        }),
    });

    const emailAuthenticator = createStubInstance(EmailCodeAuthenticator, {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        verify: stub().callsFake((verifyCode) => {
            return verifyCode === code;
        }),
    });

    beforeAll(async () => {
        const fakeModule: TestingModule = await Test.createTestingModule({
            imports: [ClientModule],
        })
            .overrideProvider(SmsCodeAuthenticator)
            .useValue(smsAuthenticator)
            .overrideProvider(EmailCodeAuthenticator)
            .useValue(emailAuthenticator)
            .compile();

        await Bootstrap.setup(
            { module: ClientModule },
            {
                instance: fakeModule,
                instanceClass: ClientModule,
            },
        );

        userSms = await makeUser(1, { twoFactorAuth: TwoFactorAuth.SMS });
        userEmail = await makeUser(1, { twoFactorAuth: TwoFactorAuth.EMAIL });
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-client/auths/verify-code (POST - User) Sms', async () => {
        const token = await authToken(userSms, true);
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-client/auths/verify-code')
            .set('Authorization', `Bearer ${token}`)
            .send({ code });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).toBeTruthy();
    });

    it('/api-client/auths/verify-code (POST - User) Email', async () => {
        const token = await authToken(userEmail, true);
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-client/auths/verify-code')
            .set('Authorization', `Bearer ${token}`)
            .send({ code });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).toBeTruthy();
    });
});
