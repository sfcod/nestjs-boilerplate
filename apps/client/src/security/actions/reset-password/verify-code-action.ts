import { Body, Controller, HttpException, HttpStatus, Post, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
import { plainToClass } from 'class-transformer';
import { AuthTokenOutput, SignerBuilder } from '@libs/security';
import { VerifyCodeInput } from '../../dto/input/verify-code-input';

@ApiTags('User')
@Controller('api/users/verify-reset-password-code')
export class VerifyCodeAction {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly entityManager: EntityManager,
        private readonly signerBuilder: SignerBuilder,
    ) {}

    @Post()
    @ApiOkResponse()
    @ApiBadRequestResponse()
    async invoke(@Request() req, @Body() data: VerifyCodeInput): Promise<any> {
        const user = await this.entityManager.getRepository(User).findOne({ recoveryPasswordToken: data.code });
        if (!user) {
            throw new HttpException('Invalid code.', HttpStatus.BAD_REQUEST);
        }
        user.recoveryPasswordToken = null;

        await this.entityManager.persistAndFlush(user);

        return plainToClass<AuthTokenOutput, any>(
            AuthTokenOutput,
            await (await this.signerBuilder.getGuestSigner()).sign(user),
        );
    }
}
