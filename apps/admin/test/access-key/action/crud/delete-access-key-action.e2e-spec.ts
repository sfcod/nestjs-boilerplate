import { HttpStatus } from '@nestjs/common';
import { authToken, Bootstrap, makeAccessKey, makeAdmin } from '@libs/test';
import { AccessKey, Admin } from '@libs/orm';

describe('DeleteAccessKey (e2e)', () => {
    let admin: Admin;
    let accessKey: AccessKey;

    beforeAll(async () => {
        admin = await makeAdmin(1);
        accessKey = await makeAccessKey(1, { owner: admin });
    });

    it('/api-admin/access-keys/{id} (DELETE)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .delete(`/api-admin/access-keys/${accessKey.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send();

        expect(res.statusCode).toBe(HttpStatus.NO_CONTENT);
    });
});
