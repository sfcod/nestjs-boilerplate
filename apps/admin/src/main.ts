import { instance as instanceAdmin } from './app.instance';

async function bootstrap() {
    await instanceAdmin();
}

bootstrap();
