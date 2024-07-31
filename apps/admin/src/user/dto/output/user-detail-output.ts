import { Exclude, Expose } from 'class-transformer';
import { MapClass, MapField } from '@libs/core';
import { User } from '@libs/orm';
import { UserOutput } from '@app/admin/common/dto/user-output';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
@MapClass(User)
export class UserDetailOutput extends UserOutput {
    @Expose()
    @MapField()
    @ApiProperty()
    firstName: string;

    @Expose()
    @MapField()
    @ApiProperty()
    lastName: string;
}
