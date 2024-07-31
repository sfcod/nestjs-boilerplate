import { Exclude } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAdminInput } from './create-admin-input';

@Exclude()
export class UpdateAdminInput extends PartialType(OmitType(CreateAdminInput, ['email'])) {}
