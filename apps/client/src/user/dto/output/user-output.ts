import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapClass, MapField } from '@libs/core';
import { User, UserGender } from '@libs/orm';
import { UserSettingsOutput } from './user-settings-output';

@Exclude()
@MapClass(User)
export class UserOutput {
    @Expose()
    @ApiProperty()
    @MapField()
    id!: string;

    @Expose()
    @ApiProperty({ deprecated: true })
    @MapField<User>(({ e }) => `${e.firstName} ${e.lastName}`.trim())
    name!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    firstName!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    lastName!: string;

    @Expose()
    @ApiProperty({ enum: UserGender.getValues() })
    @MapField()
    gender!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    email!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    status!: number;

    @Expose()
    @ApiProperty()
    @MapField<User>(async ({ e }) => (await e.getImage()) || null)
    image: string | null;

    @Expose()
    @ApiProperty()
    @MapField()
    dob!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    phoneNumber!: string;

    @Expose()
    @MapField()
    @ApiProperty()
    phoneVerified: boolean;

    @Expose()
    @MapField()
    @ApiProperty()
    emailVerified: boolean;

    @Expose()
    @MapField()
    @ApiProperty()
    twoFactorAuth: string;

    @Expose()
    @MapField<User>(({ e, mapper }) => {
        return mapper.map(UserSettingsOutput, e.settings);
    })
    @ApiProperty()
    settings: UserSettingsOutput;

    @Expose()
    @MapField()
    @ApiProperty()
    createdAt: string;

    @Expose()
    @MapField()
    @ApiProperty()
    updatedAt: string;

    @Expose()
    @MapField()
    @ApiProperty()
    deletedAt: string;
}
