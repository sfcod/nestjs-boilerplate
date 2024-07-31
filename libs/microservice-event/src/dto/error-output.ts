import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapClass, MapField } from '@libs/core';

@Exclude()
@MapClass(Error)
export class ErrorOutput {
    @Expose()
    @ApiProperty({ type: 'string' })
    @MapField<Error>(() => 'error')
    status: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    @MapField<Error>('message')
    message!: string;
}
