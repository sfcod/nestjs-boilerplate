import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { MapClass } from '@libs/core';
import { AccessKey } from '@libs/orm';
import { MapField } from '@libs/core';
import { AccessKeyOwnerOutput } from './access-key-owner-output';

@Exclude()
@MapClass(AccessKey)
export class AccessKeyOutput {
    @Expose()
    @ApiProperty()
    @MapField()
    id!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    name!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    status!: number;

    @Expose()
    @ApiProperty()
    @MapField<AccessKey>(async ({ e: { owner }, mapper }) => {
        return mapper.map(AccessKeyOwnerOutput, await owner.load());
    })
    owner!: AccessKeyOwnerOutput;

    @Expose()
    @ApiProperty()
    @MapField<AccessKey>(({ e: accessKey }) => accessKey.getPermissions())
    permissions: string[];

    @Expose()
    @ApiProperty()
    @MapField()
    createdAt!: string;

    @Expose()
    @ApiProperty()
    @MapField()
    updatedAt!: string;
}
