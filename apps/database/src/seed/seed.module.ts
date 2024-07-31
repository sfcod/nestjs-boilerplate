import { Module } from '@nestjs/common';
import { SeedCommand } from './command/seed-command';

@Module({
    imports: [],
    controllers: [],
    providers: [SeedCommand],
})
export class SeedModule {}
