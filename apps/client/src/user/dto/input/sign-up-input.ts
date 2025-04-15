import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { PhoneNumber, UniqueEntity } from '@libs/core';
import { PasswordValidation } from 'class-validator-password-check';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';
import { Admin, User } from '@libs/orm';

@Exclude()
export class SignUpInput {
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
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(255)
    @UniqueEntity(['email'], Admin, { caseSensitive: false })
    @UniqueEntity(['email'], User, { caseSensitive: false })
    email!: string;

    @Expose()
    @ApiProperty()
    @IsString()
    @PhoneNumber('US')
    @IsOptional()
    phoneNumber!: string;

    @Expose()
    @ApiProperty()
    @Validate(PasswordValidation, [passwordRequirement])
    @MinLength(8)
    @MaxLength(20)
    @IsString()
    @IsOptional()
    password!: string;
}
