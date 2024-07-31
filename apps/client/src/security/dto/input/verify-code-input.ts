import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

@Exclude()
export class VerifyCodeInput {
    @Expose()
    @ApiProperty()
    @IsString()
    code!: string;
}
