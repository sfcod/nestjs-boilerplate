import { authToken, Bootstrap, makeAdmin } from '@libs/test';
import { Admin } from '@libs/orm';

describe('DeleteAdmin (e2e)', () => {
    let admin: Admin;
    let adminSystem: Admin;

    beforeAll(async () => {
        admin = await makeAdmin(1);
        adminSystem = await makeAdmin(1);
    });

    it('/api-admin/admins/{id} (DELETE)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .delete(`/api-admin/admins/${adminSystem.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();

        expect(res.statusCode).toBe(204);
    });
});
