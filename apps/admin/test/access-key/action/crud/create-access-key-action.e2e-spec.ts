import { HttpStatus } from '@nestjs/common';
import { authToken, Bootstrap, makeAdmin } from '@libs/test';
import { AccessKeyStatus, AccessPermission, Admin } from '@libs/orm';
import { faker } from '@faker-js/faker';

describe('CreateAccessKey (e2e)', () => {
    // const app = new Bootstrap();

    let admin: Admin;

    const NAME = faker.lorem.words(3);
    const STATUS = faker.helpers.arrayElement(AccessKeyStatus.getValues());
    const PERMISSIONS = faker.helpers.arrayElements(
        AccessPermission.getValues(),
        faker.number.int({ min: 1, max: AccessPermission.getValues().length }),
    );

    beforeAll(async () => {
        admin = await makeAdmin(1);
    });

    it('/api-admin/access-keys (POST)', async () => {
        const jwtToken = await authToken(admin);
        const res: any = await Bootstrap.getHttpRequest()
            .post('/api-admin/access-keys')
            .set('Authorization', `Bearer ${jwtToken}`)
            .send({
                name: NAME,
                status: STATUS,
                permissions: PERMISSIONS,
            });

        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(Object.keys(res.body)).toEqual(
            expect.arrayContaining(['id', 'status', 'key', 'owner', 'name', 'permissions']),
        );
        expect(res.body).toEqual(
            expect.objectContaining({
                name: NAME,
                status: STATUS,
                permissions: PERMISSIONS,
            }),
        );
    });
});
