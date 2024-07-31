import { HttpStatus } from '@nestjs/common';
import { Bootstrap, makeUser, authToken, truncateTables } from '@libs/test';
import { MIKRO_ORM_DEFAULT, User } from '@libs/orm';
import { faker } from '@faker-js/faker';
import { compare } from 'bcrypt';
import { Response } from 'supertest';

describe('ChangePasswordAction (e2e)', () => {
    let user: User;
    let token: string;

    const PASSWORD = `dS$35£${faker.internet.password({ length: 6 })}`;

    beforeAll(async () => {
        await truncateTables();
    });

    beforeAll(async () => {
        user = await makeUser(1);
        token = await authToken(user);
    });

    it('/api-client/users/change-password (POST - Patient)', async () => {
        const res: Response = await Bootstrap.getHttpRequest()
            .post('/api-client/users/change-password')
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: PASSWORD,
            });
        const em = Bootstrap.getEntityManager(MIKRO_ORM_DEFAULT);
        const u = await em.getRepository(User).findOne({ email: user.email });

        expect(res.statusCode).toBe(HttpStatus.CREATED);
        expect(res.body.token).toBeTruthy();
        expect(await compare(PASSWORD, u.password)).toBe(true);
    });
});
