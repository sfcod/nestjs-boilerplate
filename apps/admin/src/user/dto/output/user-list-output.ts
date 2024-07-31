import { Exclude } from 'class-transformer';
import { MapClass } from '@libs/core';
import { User } from '@libs/orm';
import { UserOutput } from '@app/admin/common/dto/user-output';

@Exclude()
@MapClass(User)
export class UserListOutput extends UserOutput {}
