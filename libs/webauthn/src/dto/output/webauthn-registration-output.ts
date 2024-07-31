import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { JsonOutput, MapClass, MapField } from '@libs/core';
import { PublicKeyCredentialCreationOptionsJSON } from '@simplewebauthn/types';

@Exclude()
@MapClass(Object)
export class WebauthnRegistrationOutput {
    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>(({ e }) => {
        return new JsonOutput(e.rp);
    })
    rp: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>(({ e }) => {
        return new JsonOutput(e.user);
    })
    user: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>()
    challenge: string;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>(({ e }) => {
        return e.pubKeyCredParams.map((item) => new JsonOutput(item));
    })
    pubKeyCredParams: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>()
    timeout: number;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>(({ e }) => {
        return e.excludeCredentials.map((item) => new JsonOutput(item));
    })
    excludeCredentials: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>(({ e }) => {
        return new JsonOutput(e.authenticatorSelection);
    })
    authenticatorSelection: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>()
    attestation: any;

    @Expose()
    @ApiProperty()
    @MapField<PublicKeyCredentialCreationOptionsJSON>(({ e }) => {
        return new JsonOutput(e.extensions);
    })
    extensions: any;
}
