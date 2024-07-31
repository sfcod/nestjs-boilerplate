import { User } from '@libs/orm';
import { authToken, Bootstrap, makeUser } from '@libs/test';
import { ClientModule } from '@app/client/client.module';
import { createStubInstance, stub } from 'sinon';
import { Test, TestingModule } from '@nestjs/testing';
import { SmsCodeAuthenticator } from '@libs/security';
import { faker } from '@faker-js/faker';
import { Response } from 'supertest';

describe('VerifyAuthCode (e2e)', () => {
    let user: User;
    const code = faker.number.int({ min: 1000, max: 9999 }) + '';

    const smsAuthenticator = createStubInstance(SmsCodeAuthenticator, {
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
            .compile();

        await Bootstrap.setup(
            { module: ClientModule },
            {
                instance: fakeModule,
                instanceClass: ClientModule,
            },
        );

        user = await makeUser(1);
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-client/auths/verify-code (POST - User)', async () => {
        const token = await authToken(user, true);
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-client/auths/verify-code')
            .set('Authorization', `Bearer ${token}`)
            .send({ code });

        expect(res.statusCode).toBe(201);
        expect(res.body.token).toBeTruthy();
        expect(res.body.refreshToken).toBeTruthy();
    });
});
