import { Exclude, Expose } from 'class-transformer';
import { SocialDataInputInterface } from './social-data-input-interface';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class DeleteSocialDataInput implements SocialDataInputInterface {
    @Expose()
    signed_request!: string;

    @Expose()
    @ApiProperty()
    provider!: string;
}
