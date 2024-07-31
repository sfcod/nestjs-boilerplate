import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordInput } from '../../dto/input/change-password-input';
import { plainToClass } from 'class-transformer';
import { AuthTokenOutput, SignerBuilder } from '@libs/security';

@ApiTags('User')
@Controller('api/users/change-password')
export class ChangePasswordAction {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly entityManager: EntityManager,
        private readonly signerBuilder: SignerBuilder,
    ) {}

    @Post()
    @UseGuards(AuthGuard(['jwt-guest', 'jwt']))
    @ApiCreatedResponse({ type: AuthTokenOutput })
    @ApiUnauthorizedResponse()
    @ApiBearerAuth()
    async invoke(@Request() req, @Body() data: ChangePasswordInput): Promise<any> {
        const user: User = req.user;

        user.setPlainPassword(data.password);

        await this.entityManager.persistAndFlush(user);
        const signer = (await this.signerBuilder.signedBy('fully'))
            ? await this.signerBuilder.getSigner()
            : await this.signerBuilder.getGuestSigner();

        return plainToClass<AuthTokenOutput, any>(AuthTokenOutput, await signer.sign(user));
    }
}
