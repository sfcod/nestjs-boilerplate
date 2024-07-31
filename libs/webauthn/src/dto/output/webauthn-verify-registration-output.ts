import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapClass, MapField } from '@libs/core';

@Exclude()
@MapClass(Object)
export class WebauthnVerifyRegistrationOutput {
    @Expose()
    @ApiProperty()
    @MapField()
    status: string;

    @Expose()
    @ApiProperty()
    @MapField()
    message: string;

    @Expose()
    @ApiProperty()
    @MapField()
    device: string;
}
