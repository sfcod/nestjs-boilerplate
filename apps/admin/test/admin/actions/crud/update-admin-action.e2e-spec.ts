import { faker } from '@faker-js/faker';
import { authToken, Bootstrap, makeAdmin } from '@libs/test';
import { Admin } from '@libs/orm';

describe('UpdateAdmin (e2e)', () => {
    let admin: Admin;
    let adminSystem: Admin;

    const PASSWORD = `dS$35£${faker.internet.password({ length: 6 })}`;

    beforeAll(async () => {
        admin = await makeAdmin(1);
        adminSystem = await makeAdmin(1);
    });

    it('/api-admin/admins/{id} (PATCH)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .patch(`/api-admin/admins/${adminSystem.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                password: PASSWORD,
            });

        expect(res.statusCode).toBe(200);
    });
});
