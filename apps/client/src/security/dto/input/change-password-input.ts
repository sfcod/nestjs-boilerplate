import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { PasswordValidation } from '@libs/core';
import { passwordRequirement } from '../../../../../../config/password-requitement.config';

@Exclude()
export class ChangePasswordInput {
    @Expose()
    @ApiProperty()
    @IsString()
    @MinLength(8)
    @MaxLength(20)
    @Validate(PasswordValidation, [passwordRequirement])
    password!: string;
}
