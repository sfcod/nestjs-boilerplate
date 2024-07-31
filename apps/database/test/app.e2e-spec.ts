import { DatabaseModule } from './../src/database.module';
import { Bootstrap } from '@libs/test';

describe('DatabaseController (e2e)', () => {
    beforeAll(async () => {
        await Bootstrap.setup({ module: DatabaseModule });
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/ (GET)', () => {
        expect(200).toEqual(200);
    });
});
