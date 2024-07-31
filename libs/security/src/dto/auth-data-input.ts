import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class AuthDataInput {
    @Expose()
    @ApiProperty()
    username!: string;

    @Expose()
    @ApiProperty()
    password!: string;
}
