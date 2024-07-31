import { makeData } from './helpers';
import { AccessKeyPermission } from '@libs/orm';
import { faker } from '@faker-js/faker';
import { AccessPermission as AccessKeyPermissionEnum } from '@libs/orm';

export async function makeAccessKeyPermission(
    count = 1,
    fields?: Partial<AccessKeyPermission> | any,
): Promise<AccessKeyPermission | AccessKeyPermission[] | any> {
    return await makeData<AccessKeyPermission>(count, fields, async () => {
        const accessKeyPermission = new AccessKeyPermission(fields.accessKey as any);
        accessKeyPermission.permission = faker.helpers.arrayElement(AccessKeyPermissionEnum.getValues()) as string;

        return accessKeyPermission;
    });
}
