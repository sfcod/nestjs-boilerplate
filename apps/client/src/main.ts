import { instance as instanceApi } from './app.instance';

async function bootstrap() {
    await instanceApi();
}

bootstrap();
