import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { PhoneNumber, UniqueEntity } from '@libs/core';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';
import { Admin, User } from '@libs/orm';
import { PasswordValidation } from '@libs/core';
import { AdminStatus } from '@libs/orm';

@Exclude()
export class CreateAdminInput {
    @Expose()
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    @UniqueEntity(['email'], Admin, { caseSensitive: false })
    @UniqueEntity(['email'], User, { caseSensitive: false })
    email!: string;

    @Expose()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @IsOptional()
    @Validate(PasswordValidation, [passwordRequirement])
    password!: string;

    @Expose()
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @Expose()
    @ApiProperty()
    @IsIn(AdminStatus.getValues(), { message: 'status: wrong data.' })
    status: number;

    @Expose()
    @ApiProperty()
    @PhoneNumber('US')
    @IsNotEmpty()
    phoneNumber!: string;
}
