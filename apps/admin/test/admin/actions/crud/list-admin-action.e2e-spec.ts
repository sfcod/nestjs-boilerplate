import { authToken, Bootstrap, makeAdmin, truncateTables } from '@libs/test';
import { Admin } from '@libs/orm';

describe('ListAdmin (e2e)', () => {
    let admin: Admin;

    const COUNT = Math.floor(Math.random() * Math.floor(5)) + 2;

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        admin = await makeAdmin(1);

        await makeAdmin(COUNT);
    });

    it('/api-admin/admins (GET)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .get('/api-admin/admins')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(COUNT + 1);
    });
});
