import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapField } from '@libs/core';
import { MapClass } from '@libs/core';
import { Admin } from '@libs/orm';

@Exclude()
@MapClass(Admin)
export class AccessKeyOwnerOutput {
    @Expose()
    @MapField()
    @ApiProperty()
    id: string;

    @Expose()
    @MapField()
    @ApiProperty()
    name: string;

    @Expose()
    @MapField()
    @ApiProperty()
    email: string;

    @Expose()
    @MapField()
    @ApiProperty()
    status: number;

    @Expose()
    @MapField()
    @ApiProperty()
    createdAt: string;
}
