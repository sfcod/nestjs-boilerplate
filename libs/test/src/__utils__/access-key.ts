import { makeData } from './helpers';
import { AccessKey, AccessKeyStatus, AccessKeyPermission } from '@libs/orm';
import { Bootstrap } from './bootstrap';
import { AccessKeyManager } from '@libs/access-key';
import { makeAdmin } from './admin';
import { faker } from '@faker-js/faker';

export async function makeAccessKey(
    count = 1,
    fields?: Partial<AccessKey | any>,
): Promise<AccessKey | AccessKey[] | any> {
    const { owner = await makeAdmin(1), permissions, ...rest } = fields || {};

    return await makeData<AccessKey>(count, rest, async () => {
        const accessKey = new AccessKey(owner);
        const accessKeyManager = Bootstrap.get<AccessKeyManager>(AccessKeyManager);
        const generatedKey = await accessKeyManager.generate();
        accessKey.name = faker.person.jobTitle();
        accessKey.key = generatedKey.hashedKey;
        accessKey.salt = generatedKey.salt;
        accessKey.status = AccessKeyStatus.STATUS_ACTIVE;
        accessKey.name = faker.lorem.words(3);
        if (permissions) {
            for (const permission of permissions) {
                const accessKeyPermission = new AccessKeyPermission(accessKey);
                accessKeyPermission.permission = permission;
                accessKey.permissions.add(accessKeyPermission);
            }
        }

        return accessKey;
    });
}
