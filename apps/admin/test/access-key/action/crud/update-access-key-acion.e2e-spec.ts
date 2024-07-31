import { HttpStatus } from '@nestjs/common';
import { authToken, Bootstrap, makeAccessKey, makeAdmin } from '@libs/test';
import { AccessKey, AccessKeyStatus, Admin } from '@libs/orm';
import { faker } from '@faker-js/faker';

describe('UpdateAccessKey (e2e)', () => {
    let admin: Admin;
    let accessKey: AccessKey;

    const STATUS = faker.helpers.arrayElement(AccessKeyStatus.getValues());
    const NAME = faker.lorem.words(2);

    beforeAll(async () => {
        admin = await makeAdmin(1);
        accessKey = await makeAccessKey(1, { owner: admin });
    });

    it('/api-admin/access-keys/{id} (DELETE)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .patch(`/api-admin/access-keys/${accessKey.id}`)
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                status: STATUS,
                name: NAME,
            });

        expect(res.statusCode).toBe(HttpStatus.OK);
        expect(Object.keys(res.body)).toEqual(expect.arrayContaining(['id', 'status', 'owner', 'name', 'permissions']));
        expect(res.body).toEqual(
            expect.objectContaining({
                name: NAME,
                status: STATUS,
            }),
        );
    });
});
