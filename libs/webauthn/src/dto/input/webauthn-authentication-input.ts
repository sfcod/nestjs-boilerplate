import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ExistsEntity } from '@libs/core';
import { User, UserStatus } from '@libs/orm';

@Exclude()
export class WebauthnAuthenticationInput {
    @Expose()
    @ApiProperty()
    @ExistsEntity({ user: 'id' }, User, {
        where: {
            status: [
                UserStatus.STATUS_ACTIVE,
                UserStatus.STATUS_PENDING_PHONE_VERIFICATION,
                UserStatus.STATUS_PENDING_EMAIL_VERIFICATION,
            ],
        },
    })
    @IsUUID('4')
    @IsNotEmpty()
    user: string;
}
