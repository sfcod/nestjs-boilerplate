import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { WebauthnAuthenticationInput } from './webauthn-authentication-input';
import { AuthenticationResponseJSON } from '@simplewebauthn/types';

@Exclude()
export class WebauthnVerifyAuthenticationInput extends WebauthnAuthenticationInput {
    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    payload: AuthenticationResponseJSON;
}
