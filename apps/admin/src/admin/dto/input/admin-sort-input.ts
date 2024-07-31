import { Exclude, Expose } from 'class-transformer';
import { Sortable } from '@libs/core';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { QueryOrder } from '@mikro-orm/core';
import { IsIn, IsOptional } from 'class-validator';

@Exclude()
export class AdminSortInput extends Sortable {
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
