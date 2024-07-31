import { faker } from '@faker-js/faker';
import { authToken, Bootstrap, makeAdmin, makeUser, truncateTables } from '@libs/test';
import { Admin, User } from '@libs/orm';

describe('UpdateUser (e2e)', () => {
    let user: User;
    let admin: Admin;

    const NAME = faker.internet.userName();

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        admin = await makeAdmin(1);
        user = await makeUser(1);
    });

    it('/api-admin/users/{id} (PATCH)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .patch(`/api-admin/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                firstName: NAME,
            });
        expect(res.statusCode).toBe(200);
        expect(res.body.firstName).toBe(NAME);
    });
});
