import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Callback } from '@libs/core';
import { User, UserStatus } from '@libs/orm';

@Exclude()
export class ResetPasswordInput {
    @Expose()
    @ApiProperty()
    @Callback<ResetPasswordInput, string>(
        async ({ value, em }) => {
            const user = await em.findOne(User, {}, { filters: { email: { value: value } } });
            return ![UserStatus.STATUS_INACTIVE].includes(user?.status);
        },
        { message: 'User is inactive, please contact support' },
    )
    @IsEmail()
    username!: string;
}
