import { instance as instanceDb } from './app.instance';
import '../../../config/migration.config';

async function bootstrap() {
    await instanceDb();
}

bootstrap();
