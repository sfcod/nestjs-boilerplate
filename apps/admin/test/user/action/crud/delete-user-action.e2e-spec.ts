import { authToken, Bootstrap, makeUser, makeAdmin, truncateTables } from '@libs/test';
import { Admin, User } from '@libs/orm';

describe('DeleteUser (e2e)', () => {
    let user: User;
    let admin: Admin;

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        admin = await makeAdmin(1);
        user = await makeUser(1);
    });

    it('/api-admin/users/{id} (DELETE) - try to delete active user', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .delete(`/api-admin/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(204);
    });
});
