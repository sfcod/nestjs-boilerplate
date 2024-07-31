import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SocialDataInputInterface } from './social-data-input-interface';
import { IsOptional } from 'class-validator';

@Exclude()
export class UserSocialDataInput implements SocialDataInputInterface {
    @Expose()
    @ApiProperty()
    token!: string;

    @Expose()
    @ApiProperty()
    @IsOptional()
    email?: string;

    @Expose()
    @ApiProperty()
    provider!: string;
}
