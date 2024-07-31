import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Callback, PhoneNumber } from '@libs/core';
import {
    IsDateString,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsTimeZone,
    MaxLength,
    MinLength,
    Validate,
    ValidateNested,
} from 'class-validator';
import * as moment from 'moment';
import { UserGender } from '@libs/orm';
import { PasswordValidation } from 'class-validator-password-check';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';
import { UserSettingsInput } from './user-settings-input';

@Exclude()
export class UpdateUserInput {
    @Expose()
    @ApiProperty()
    @MaxLength(120)
    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @Expose()
    @ApiProperty()
    @MaxLength(120)
    @IsString()
    @IsNotEmpty()
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
    @ApiProperty({ enum: UserGender.getValues() })
    @IsIn(UserGender.getValues(), { message: 'Invalid value.' })
    @IsNotEmpty()
    gender!: string;

    @Expose()
    @ApiProperty()
    @Callback<UpdateUserInput, string>(
        ({ value }) => {
            return moment().diff(moment(value).set({ hour: 0, minute: 0, second: 0 }), 'years') >= 1;
        },
        { message: 'User must be at least 1 year old' },
    )
    @IsDateString()
    @IsNotEmpty()
    dob!: string;

    @Expose()
    @ApiProperty()
    @PhoneNumber('US')
    @IsNotEmpty()
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
