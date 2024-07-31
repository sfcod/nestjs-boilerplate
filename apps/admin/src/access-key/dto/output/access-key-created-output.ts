import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AccessKeyOutput } from './access-key-output';

export class AccessKeyCreatedOutput extends AccessKeyOutput {
    @Expose()
    @ApiProperty()
    key!: string;
}
