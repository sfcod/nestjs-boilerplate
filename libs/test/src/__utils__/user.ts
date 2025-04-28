import { User, UserSocial, UserStatus } from '@libs/orm';
import { faker } from '@faker-js/faker';
import { makeData } from './helpers';
import { DateTime } from 'luxon';

export async function makeUser(count = 1, fields?: Partial<User | any>): Promise<User | User[] | any> {
    const { plainPassword, ...rest } = fields || {};

    const users = await makeData<User>(count, rest, async () => {
        const user = new User();
        user.phoneNumber = '4844######'.replace(/#+/g, (m) => faker.string.numeric(m.length));
        user.phoneVerified = true;
        user.emailVerified = true;
        user.twoFactorAuth = null;
        user.firstName = faker.person.firstName();
        user.lastName = faker.person.lastName();
        user.email = faker.internet.email();
        user.status = UserStatus.STATUS_ACTIVE;
        user.setPlainPassword(plainPassword || faker.internet.password());

        return user;
    });

    return users;
}

export async function makeUserSocial(count = 1, fields?: Partial<UserSocial>): Promise<User | User[] | any> {
    const { user = await makeUser(1), ...rest } = fields;

    return await makeData<UserSocial>(count, rest, async () => {
        const userSocial = new UserSocial(user);
        userSocial.provider = 'google';
        userSocial.socialUserId = faker.string.uuid();

        return userSocial;
    });
}
