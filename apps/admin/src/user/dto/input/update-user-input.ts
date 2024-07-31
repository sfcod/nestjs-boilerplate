import { Exclude } from 'class-transformer';
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserInput } from './create-user-input';

@Exclude()
export class UpdateUserInput extends PartialType(OmitType(CreateUserInput, ['email'] as const)) {}
