import { HttpStatus } from '@nestjs/common';
import { Bootstrap, makeUser } from '@libs/test';
import { User } from '@libs/orm';
import { Response } from 'supertest';
import { createStubInstance, stub } from 'sinon';
import { Mailer } from '@libs/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { ClientModule } from '@app/client/client.module';

describe('ResetPasswordAction (e2e)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let user: User;
    let sentToEmail: string;

    beforeAll(async () => {
        const mailer = createStubInstance(Mailer, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sendMail: stub().callsFake(({ to }: any) => {
                sentToEmail = to;
            }),
        });
        const fakeModule: TestingModule = await Test.createTestingModule({
            imports: [ClientModule],
        })
            .overrideProvider(Mailer)
            .useValue(mailer)
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

    it('/api-client/users/reset-password (POST - User)', async () => {
        const res: Response = await Bootstrap.getHttpRequest().post('/api-client/users/reset-password').send({
            email: user.email,
        });
        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(sentToEmail).toBe(user.email);
    });
});
