import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapField } from '@libs/core';
import { User } from '@libs/orm';
import { MapClass } from '@libs/core';

@Exclude()
@MapClass(User)
export class UserOutput {
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
    firstName: string;

    @Expose()
    @MapField()
    @ApiProperty()
    lastName: string;

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

    @Expose()
    @MapField()
    @ApiProperty()
    updatedAt: string;

    @Expose()
    @MapField()
    @ApiProperty()
    deletedAt: string;

    @Expose()
    @MapField()
    @ApiProperty()
    dob: string;

    @Expose()
    @MapField()
    @ApiProperty()
    job: string;

    @Expose()
    @MapField()
    @ApiProperty()
    phoneNumber: string;

    @Expose()
    @MapField()
    @ApiProperty()
    gender: string;
}
