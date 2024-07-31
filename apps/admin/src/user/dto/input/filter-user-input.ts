import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Paginated, transformToILike } from '@libs/core';
import { SortUserInput } from './sort-user-input';

@Exclude()
export class FilterUserInput extends Paginated {
    @Expose()
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @Expose()
    @ApiPropertyOptional()
    @Transform(transformToILike, { toClassOnly: true })
    @IsOptional()
    email?: string;

    @Expose()
    @ApiPropertyOptional()
    @IsOptional()
    name?: string;

    @Expose()
    @ApiPropertyOptional()
    @Transform(
        ({ value }) => {
            if (value === undefined) return undefined;
            return value instanceof Array ? value : [value];
        },
        { toClassOnly: true },
    )
    @IsOptional()
    status?: number[];

    @Expose()
    @ApiPropertyOptional()
    @Transform(transformToILike, { toClassOnly: true })
    @IsOptional()
    phoneNumber: string;

    @Expose()
    @ApiPropertyOptional({ type: SortUserInput })
    @Type(() => SortUserInput)
    @ValidateNested()
    [SortUserInput.NAME_PREFIX]?: SortUserInput;
}
