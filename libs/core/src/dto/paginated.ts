import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Expose } from 'class-transformer';

export class Paginated {
    @Expose()
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @Expose()
    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;
}
