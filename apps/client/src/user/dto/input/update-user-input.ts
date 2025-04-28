import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Callback, PhoneNumber } from '@libs/core';
import {
    IsDateString,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsTimeZone,
    MaxLength,
    MinLength,
    Validate,
    ValidateNested,
} from 'class-validator';
import { DateTime } from 'luxon';
import { PasswordValidation } from 'class-validator-password-check';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';
import { UserSettingsInput } from './user-settings-input';

@Exclude()
export class UpdateUserInput {
    @Expose()
    @ApiProperty()
    @MaxLength(120)
    @IsString()
    @IsOptional()
    firstName!: string;

    @Expose()
    @ApiProperty()
    @MaxLength(120)
    @IsString()
    @IsOptional()
    lastName!: string;

    @Expose()
    @ApiProperty()
    @Validate(PasswordValidation, [passwordRequirement])
    @MinLength(8)
    @MaxLength(20)
    @IsString()
    @IsOptional()
    password!: string;

    @Expose()
    @ApiProperty()
    @PhoneNumber('US')
    @IsOptional()
    phoneNumber!: string;

    @Expose()
    @ApiProperty({ type: UserSettingsInput })
    @Type(() => UserSettingsInput)
    @ValidateNested()
    @IsOptional()
    settings: UserSettingsInput;

    @Expose()
    @ApiProperty()
    @IsTimeZone()
    @IsOptional()
    timezone: string;
}
