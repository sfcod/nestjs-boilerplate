import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapClass, MapField } from '@libs/core';
import { UserSettings } from '@libs/orm';

@Exclude()
@MapClass(UserSettings)
export class UserSettingsOutput {
    @Expose()
    @MapField()
    @ApiProperty()
    emailsEnabled: boolean;

    @Expose()
    @MapField()
    @ApiProperty()
    notificationsEnabled: boolean;
}
