import { Bootstrap } from '@libs/test';
import { ClientModule } from '@app/client/client.module';

beforeAll(async () => {
    await Bootstrap.setup({
        module: ClientModule,
    });
});

afterAll(async () => {
    await Bootstrap.close();
});
