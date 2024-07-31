import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JsonOutput, MapClass, MapField } from '@libs/core';
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/types';

@Exclude()
@MapClass(Object)
export class WebauthnAuthenticationOutput {
    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialRequestOptionsJSON>()
    challenge: string;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialRequestOptionsJSON>()
    timeout: number;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialRequestOptionsJSON>()
    rpId: string;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialRequestOptionsJSON>(({ e }) => {
        return e.allowCredentials.map((item) => new JsonOutput(item));
    })
    allowCredentials: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialRequestOptionsJSON>()
    userVerification: string;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialRequestOptionsJSON>(({ e }) => {
        return new JsonOutput(e.extensions);
    })
    extensions: any;
}
