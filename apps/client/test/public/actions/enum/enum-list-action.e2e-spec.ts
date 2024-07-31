import { HttpStatus } from '@nestjs/common';
import { Response } from 'supertest';
import { Bootstrap } from '@libs/test';

describe('EnumListAction (e2e)', () => {
    it('/api-cleint/enums (GET)', async () => {
        const res: Response = await Bootstrap.getHttpRequest().get('/api-client/enums');

        expect(res.statusCode).toBe(HttpStatus.OK);
    });
});
