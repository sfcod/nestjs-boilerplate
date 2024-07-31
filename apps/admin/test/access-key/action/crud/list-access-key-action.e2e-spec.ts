import { HttpStatus } from '@nestjs/common';
import { authToken, Bootstrap, makeAccessKey, makeAdmin, truncateTables } from '@libs/test';
import { Admin } from '@libs/orm';

describe('ListAccessKey (e2e)', () => {
    let admin: Admin;

    const COUNT = Math.floor(Math.random() * Math.floor(5)) + 2;

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        admin = await makeAdmin(1);
        await makeAccessKey(COUNT);
    });

    it('/api-admin/access-keys (GET)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .get(`/api-admin/access-keys`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();

        expect(res.statusCode).toBe(HttpStatus.OK);
        expect(res.body.length).toBe(COUNT);
    });
});
