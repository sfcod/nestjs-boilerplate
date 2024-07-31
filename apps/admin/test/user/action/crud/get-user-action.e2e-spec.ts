import { authToken, Bootstrap, makeAdmin, makeUser } from '@libs/test';
import { Admin, User } from '@libs/orm';

describe('GetUser (e2e)', () => {
    let user: User;
    let admin: Admin;

    beforeAll(async () => {
        admin = await makeAdmin(1);
        user = await makeUser(1);
    });

    it('/api-admin/users/{id} (GET)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .get(`/api-admin/users/${user.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(user.email);
    });
});
