import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Paginated } from '@libs/core';
import { SortAccessKeyInput } from './sort-access-key-input';
import { transformToILike } from '@libs/core';

@Exclude()
export class FilterAccessKeyInput extends Paginated {
    @Expose()
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID('4')
    id?: string;

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
    @ApiPropertyOptional()
    @IsOptional()
    owner?: string;

    @Expose()
    @ApiPropertyOptional()
    @Transform(({ value }) => (value ? { permission: value } : undefined), { toClassOnly: true })
    @IsOptional()
    permissions: string;

    @Expose()
    @ApiPropertyOptional({ type: SortAccessKeyInput })
    @Type(() => SortAccessKeyInput)
    @ValidateNested()
    [SortAccessKeyInput.NAME_PREFIX]?: SortAccessKeyInput;
}
