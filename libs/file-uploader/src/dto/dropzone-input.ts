import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID, MaxLength } from 'class-validator';

@Exclude()
export class DropzoneInput {
    @Expose()
    @ApiProperty()
    @IsOptional()
    @MaxLength(255)
    @IsUUID(4)
    dzuuid!: string;

    @Expose()
    @ApiProperty()
    @IsOptional()
    dzchunkindex!: string;

    @Expose()
    @ApiProperty()
    @IsOptional()
    dztotalfilesize!: string;

    @Expose()
    @ApiProperty()
    @IsOptional()
    dztotalchunkcount!: string;
}
