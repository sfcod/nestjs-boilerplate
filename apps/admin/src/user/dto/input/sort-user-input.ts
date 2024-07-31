import { Exclude, Expose } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { QueryOrder } from '@mikro-orm/core';
import { Sortable } from '@libs/core';

@Exclude()
export class SortUserInput extends Sortable {
    @Expose()
    @ApiPropertyOptional({ name: Sortable.prefix('email'), enum: [QueryOrder.ASC, QueryOrder.DESC] })
    @IsOptional()
    @IsIn([QueryOrder.ASC, QueryOrder.DESC])
    email?: QueryOrder.ASC | QueryOrder.DESC;

    @Expose()
    @ApiPropertyOptional({ name: Sortable.prefix('name'), enum: [QueryOrder.ASC, QueryOrder.DESC] })
    @IsOptional()
    @IsIn([QueryOrder.ASC, QueryOrder.DESC])
    name?: QueryOrder.ASC | QueryOrder.DESC;

    @Expose()
    @ApiPropertyOptional({ name: Sortable.prefix('createdAt'), enum: [QueryOrder.ASC, QueryOrder.DESC] })
    @IsOptional()
    @IsIn([QueryOrder.ASC, QueryOrder.DESC])
    createdAt?: QueryOrder.ASC | QueryOrder.DESC;

    @Expose()
    @ApiPropertyOptional({ name: Sortable.prefix('updatedAt'), enum: [QueryOrder.ASC, QueryOrder.DESC] })
    @IsOptional()
    @IsIn([QueryOrder.ASC, QueryOrder.DESC])
    updatedAt?: QueryOrder.ASC | QueryOrder.DESC;
}
