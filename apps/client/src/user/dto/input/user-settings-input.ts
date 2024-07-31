import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

@Exclude()
export class UserSettingsInput {
    @Expose()
    @ApiProperty()
    @Transform(({ value }) => (value === null ? undefined : value))
    @IsBoolean()
    @IsOptional()
    emailsEnabled: boolean;

    @Expose()
    @ApiProperty()
    @Transform(({ value }) => (value === null ? undefined : value))
    @IsBoolean()
    @IsOptional()
    notificationsEnabled: boolean;
}
