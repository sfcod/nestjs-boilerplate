import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { RegistrationResponseJSON } from '@simplewebauthn/types';

@Exclude()
export class WebauthnVerifyRegistrationInput {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    payload: RegistrationResponseJSON;
}
