import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class AuthTokenOutput {
    @Expose()
    @ApiProperty()
    token!: string;

    @Expose()
    @ApiProperty()
    refreshToken!: string;
}
