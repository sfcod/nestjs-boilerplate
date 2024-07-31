import { authToken, Bootstrap, makeAdmin, makeUser, truncateTables } from '@libs/test';
import { Admin } from '@libs/orm';

describe('ListUser (e2e)', () => {
    let admin: Admin;

    const COUNT = Math.floor(Math.random() * Math.floor(5)) + 2;

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        admin = await makeAdmin(1);
        await makeUser(COUNT - 1);
        await makeUser(1, { firstName: 'Will', lastName: 'Smith' });
    });

    it('/api-admin/users (GET)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .get('/api-admin/users/')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(COUNT);
    });

    it('/api-admin/users (GET) Filtered by name', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .get(`/api-admin/users?name=Will Smith`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0]?.firstName).toBe('Will');
        expect(res.body[0]?.lastName).toBe('Smith');
    });
});
