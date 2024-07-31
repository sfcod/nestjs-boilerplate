import { Exclude } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { CreateAccessKeyInput } from './create-access-key-input';

@Exclude()
export class UpdateAccessKeyInput extends PartialType(CreateAccessKeyInput) {}
