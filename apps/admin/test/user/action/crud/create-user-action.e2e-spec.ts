import { faker } from '@faker-js/faker';
import { authToken, Bootstrap, makeAdmin } from '@libs/test';
import { Admin, UserGender, UserStatus } from '@libs/orm';
import { createStubInstance, stub } from 'sinon';
import { Mailer } from '@libs/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminPanelModule } from '@app/admin/admin-panel.module';

describe('CreateUser (e2e)', () => {
    let admin: Admin;
    let sentToEmail: string;

    const FIRSTNAME = faker.person.firstName();
    const LASTNAME = faker.person.lastName();
    const EMAIL = faker.internet.email();
    const PASSWORD = '12d^7Udad';
    const GENDER = faker.helpers.arrayElement(UserGender.getValues());
    const DOB = '1970-01-27';
    const PHONE = '4844######'.replace(/#+/g, (m) => faker.string.numeric(m.length));
    const STATUS = UserStatus.STATUS_ACTIVE;

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

    it('/api-admin/users (POST)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .post('/api-admin/users')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                email: EMAIL,
                password: PASSWORD,
                firstName: FIRSTNAME,
                lastName: LASTNAME,
                gender: GENDER,
                dob: DOB,
                phoneNumber: PHONE,
                status: STATUS,
            });

        expect(res.statusCode).toBe(201);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining([
                'id',
                'firstName',
                'lastName',
                'email',
                'gender',
                'dob',
                'status',
                'createdAt',
                'updatedAt',
                'dob',
                'phoneNumber',
            ]),
        );

        expect(res.body).toEqual(
            expect.objectContaining({
                email: EMAIL,
                firstName: FIRSTNAME,
                lastName: LASTNAME,
                gender: GENDER,
                phoneNumber: PHONE,
                status: STATUS,
                dob: DOB,
            }),
        );
        expect(sentToEmail).toBe(EMAIL);
    });
});
