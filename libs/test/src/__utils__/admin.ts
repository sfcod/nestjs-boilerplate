import { faker } from '@faker-js/faker';
import { Admin, AdminStatus } from '@libs/orm';
import { makeData } from './helpers';

export async function makeAdmin(count = 1, fields?: Partial<Admin | any>): Promise<Admin | Admin[] | any> {
    const { plainPassword, ...rest } = fields || {};

    return await makeData<Admin>(count, rest, async () => {
        const admin = new Admin();
        admin.email = faker.internet.email();
        admin.name = faker.internet.userName();
        admin.status = AdminStatus.STATUS_ACTIVE;
        admin.phoneNumber = '4844######'.replace(/#+/g, (m) => faker.string.numeric(m.length));
        admin.setPlainPassword(plainPassword || faker.internet.password());

        return admin;
    });
}
