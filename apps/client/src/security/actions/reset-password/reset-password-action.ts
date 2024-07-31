import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResetPasswordRequestEvent } from '../../event/reset-password-request.event';
import { ResetPasswordInput } from '../../dto/input/reset-password-input';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
import { CodeGenerator } from '@libs/core';
import { ResetPasswordTokenNotification } from '../../notification/reset-password-token-notification';
import { NotificationEmitter } from '@libs/notification';
import { Request } from 'express';

@ApiTags('User')
@Controller('api/users/reset-password')
export class ResetPasswordAction {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly entityManager: EntityManager,
        private readonly codeGenerator: CodeGenerator,
        private readonly notification: NotificationEmitter,
    ) {}

    @Post()
    @ApiOkResponse()
    @ApiBadRequestResponse()
    async invoke(@Req() req: Request, @Body() data: ResetPasswordInput): Promise<any> {
        const user = await this.entityManager.findOne(User, {}, { filters: { email: { value: data.email } } });
        if (!user || user.deletedAt) {
            throw new HttpException('The email is invalid', HttpStatus.BAD_REQUEST);
        }

        user.recoveryPasswordToken = this.codeGenerator.generateHexString(6);
        await this.entityManager.persistAndFlush(user);
        await this.notification.emit(
            ResetPasswordTokenNotification,
            {
                user: user,
                code: user.recoveryPasswordToken,
            },
            req.user,
        );
        await this.eventEmitter.emitAsync(ResetPasswordRequestEvent.eventName, new ResetPasswordRequestEvent(user));

        return {};
    }
}
