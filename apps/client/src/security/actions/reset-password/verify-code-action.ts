import { Body, Controller, HttpException, HttpStatus, Post, Req, Request } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
import { plainToClass } from 'class-transformer';
import { AuthTokenOutput, CredentialBruteForce, ResetPasswordService, SignerBuilder } from '@libs/security';
import { VerifyCodeInput } from '../../dto/input/verify-code-input';

@ApiTags('User')
@Controller('api-client/users/verify-reset-password-code')
export class VerifyCodeAction {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly signerBuilder: SignerBuilder,
        private readonly credentialBruteForce: CredentialBruteForce,
        private readonly resetPasswordService: ResetPasswordService,
    ) {}

    @Post()
    @ApiOkResponse()
    @ApiBadRequestResponse()
    async invoke(@Req() req: any, @Body() data: VerifyCodeInput): Promise<any> {
        const user = await this.resetPasswordService.verify(data.code, req);
        if (!user) {
            throw new HttpException('Invalid code.', HttpStatus.BAD_REQUEST);
        }
        user.recoveryPasswordToken = null;

        await this.entityManager.persistAndFlush(user);

        // Need to reset the brute force counter on login
        await this.credentialBruteForce.reset(req, CredentialBruteForce.USERNAME_AND_IP_KEY_PREFIX, {
            pattern: ['user'],
            username: user.email,
        });

        return plainToClass<AuthTokenOutput, any>(
            AuthTokenOutput,
            await (await this.signerBuilder.getGuestSigner()).sign(user),
        );
    }
}
