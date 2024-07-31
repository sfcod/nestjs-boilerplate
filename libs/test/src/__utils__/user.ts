import { User, UserGender, UserStatus } from '@libs/orm';
import { faker } from '@faker-js/faker';
import { makeData } from './helpers';
import * as moment from 'moment';

export async function makeUser(count = 1, fields?: Partial<User | any>): Promise<User | User[] | any> {
    const { plainPassword, ...rest } = fields || {};

    const users = await makeData<User>(count, rest, async () => {
        const user = new User();
        user.dob = moment(faker.date.past()).format('YYYY-MM-DD HH:mm:ss');
        user.gender = UserGender.FEMALE;
        user.phoneNumber = faker.helpers.replaceSymbolWithNumber('4844######');
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
