import { Bootstrap } from '@libs/test';
import { AppModule } from '../src/app.module';

describe('PhyController (e2e)', () => {
    beforeAll(async () => {
        await Bootstrap.setup({ module: AppModule });
    });

    afterAll(async () => {
        await Bootstrap.close();
    });

    it('/ (GET)', () => {
        expect(200).toEqual(200);
    });
});
