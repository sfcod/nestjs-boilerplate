import { Bootstrap } from '@libs/test';
import { AdminPanelModule } from '@app/admin/admin-panel.module';

beforeAll(async () => {
    await Bootstrap.setup({ module: AdminPanelModule });
});

afterAll(async () => {
    await Bootstrap.close();
});
