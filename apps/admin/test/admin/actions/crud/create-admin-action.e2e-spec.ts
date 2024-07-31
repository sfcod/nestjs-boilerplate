import { faker } from '@faker-js/faker';
import { authToken, Bootstrap, makeAdmin } from '@libs/test';
import { Admin, AdminStatus } from '@libs/orm';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminPanelModule } from '@app/admin/admin-panel.module';
import { createStubInstance, stub } from 'sinon';
import { Mailer } from '@libs/mailer';

describe('CreateAdmin (e2e)', () => {
    let admin: Admin;
    let sentToEmail: string;

    const EMAIL = faker.internet.email();
    const PASSWORD = `dS$35£${faker.internet.password({ length: 6 })}`;
    const NAME = faker.internet.userName();
    const PHONE = faker.helpers.replaceSymbolWithNumber('4844######');

    beforeAll(async () => {
        const mailer = createStubInstance(Mailer, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            sendMail: stub().callsFake(({ to }: any) => {
                sentToEmail = to;
            }),
        });
        const fakeModule: TestingModule = await Test.createTestingModule({
            imports: [AdminPanelModule],
        })
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
        admin = await makeAdmin(1);
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/api-admin/admins (POST)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .post('/api-admin/admins')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                email: EMAIL,
                password: PASSWORD,
                name: NAME,
                status: AdminStatus.STATUS_ACTIVE,
                phoneNumber: PHONE,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.email).toBe(EMAIL);
        expect(sentToEmail).toBe(EMAIL);
    });
});
