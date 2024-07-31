import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { Paginated } from '@libs/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { transformToILike } from '@libs/core';
import { IsOptional, ValidateNested } from 'class-validator';
import { AdminSortInput } from './admin-sort-input';

@Exclude()
export class AdminFilterInput extends Paginated {
    @Expose()
    @ApiPropertyOptional()
    @Transform(transformToILike, { toClassOnly: true })
    @IsOptional()
    email?: string;

    @Expose()
    @ApiPropertyOptional()
    @Transform(transformToILike, { toClassOnly: true })
    @IsOptional()
    name?: string;

    @Expose()
    @ApiPropertyOptional()
    @IsOptional()
    status?: number;

    @Expose()
    @ApiPropertyOptional({ type: AdminSortInput })
    @Type(() => AdminSortInput)
    @ValidateNested()
    [AdminSortInput.NAME_PREFIX]?: AdminSortInput;
}
