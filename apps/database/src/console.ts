import 'apps/dotenv';
import { BootstrapConsole } from 'nestjs-console';
import { DatabaseModule } from './database.module';

const bootstrap = new BootstrapConsole({
    module: DatabaseModule,
    useDecorators: true,
});
bootstrap.init().then(async (app) => {
    try {
        // init your app
        await app.init();
        // boot the cli
        await bootstrap.boot();
        process.exit(0);
    } catch (e) {
        console.error(e);

        process.exit(1);
    }
});
