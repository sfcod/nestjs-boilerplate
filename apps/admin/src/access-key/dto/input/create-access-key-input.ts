import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccessKeyStatus } from '@libs/orm';
import { ArrayNotEmpty, IsArray, IsIn, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { AccessPermission } from '@libs/orm';

@Exclude()
export class CreateAccessKeyInput {
    @Expose()
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    @MinLength(3)
    name!: string;

    @Expose()
    @ApiProperty({ enum: AccessKeyStatus.getValues() })
    @IsNotEmpty()
    @Type(() => Number)
    @IsIn(AccessKeyStatus.getValues())
    status!: number;

    @Expose()
    @ApiProperty()
    @IsArray()
    @ArrayNotEmpty()
    @IsIn(AccessPermission.getValues(), { each: true })
    permissions!: string[];
}
