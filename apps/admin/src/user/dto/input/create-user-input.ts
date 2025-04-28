import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { Admin, User, UserStatus } from '@libs/orm';
import { PasswordValidation, PhoneNumber, UniqueEntity } from '@libs/core';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';

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
    @PhoneNumber('US')
    @IsNotEmpty()
    phoneNumber!: string;

    @Expose()
    @ApiProperty()
    @IsOptional()
    @IsIn(UserStatus.getValues(), { message: 'Status: wrong data.' })
    status!: number;
}
