import '../../dotenv';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

export const imports: any[] = [];

@Module({
    imports: [...imports, HealthModule],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
