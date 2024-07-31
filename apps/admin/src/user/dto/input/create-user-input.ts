import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
    IsDateString,
    IsEmail,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    Validate,
} from 'class-validator';
import { Admin, User, UserGender, UserStatus } from '@libs/orm';
import { Callback, PasswordValidation, PhoneNumber, UniqueEntity } from '@libs/core';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';
import * as moment from 'moment';

@Exclude()
export class CreateUserInput {
    @Expose()
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    firstName!: string;

    @Expose()
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(120)
    lastName!: string;

    @Expose()
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @UniqueEntity(['email'], User, { message: 'User with this email already exists', caseSensitive: false })
    @UniqueEntity(['email'], Admin, { message: 'User with this email already exists', caseSensitive: false })
    email!: string;

    @Expose()
    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @IsOptional()
    @Validate(PasswordValidation, [passwordRequirement])
    password!: string;

    @Expose()
    @ApiProperty()
    @Callback<CreateUserInput, string>(
        ({ value }) => {
            return moment().diff(moment(value).set({ hour: 0, minute: 0, second: 0 }), 'years') >= 1; // 1 year old
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
    @ApiProperty()
    @IsOptional()
    @IsIn(UserStatus.getValues(), { message: 'Status: wrong data.' })
    status!: number;

    @Expose()
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(50)
    @IsIn(UserGender.getValues(), { message: 'Gender: wrong data.' })
    gender!: string;
}
