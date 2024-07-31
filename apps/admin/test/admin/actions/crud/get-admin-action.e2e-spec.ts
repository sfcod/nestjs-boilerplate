import { authToken, Bootstrap, makeAdmin } from '@libs/test';
import { Admin } from '@libs/orm';

describe('GetAdmin (e2e)', () => {
    let admin: Admin;
    let adminSystem: Admin;

    beforeAll(async () => {
        admin = await makeAdmin(1);
        adminSystem = await makeAdmin(1);
    });

    it('/api-admin/admins/{id} (GET)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .get(`/api-admin/admins/${adminSystem.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(adminSystem.email);
    });

    it('/api-admin/admins/{id} (GET) - forbidden for guest', async () => {
        const jwtToken = await authToken(admin, true);
        const res: any = await Bootstrap.getHttpRequest()
            .get(`/api-admin/admins/${adminSystem.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();

        expect(res.statusCode).toBe(403);
    });

    it('/api-admin/admins/{id} (GET) - allowed for same guest admin', async () => {
        const jwtToken = await authToken(adminSystem, true);
        const res: any = await Bootstrap.getHttpRequest()
            .get(`/api-admin/admins/${adminSystem.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(adminSystem.email);
    });
});
