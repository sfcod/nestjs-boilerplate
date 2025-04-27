import { Body, Controller, HttpException, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResetPasswordRequestEvent } from '../../event/reset-password-request.event';
import { ResetPasswordInput } from '../../dto/input/reset-password-input';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
import { ResetPasswordTokenNotification } from '../../notification/reset-password-token-notification';
import { NotificationEmitter } from '@libs/notification';
import { Request } from 'express';
import { ResetPasswordService } from '@libs/security';

@ApiTags('User')
@Controller('api-client/users/reset-password')
export class ResetPasswordAction {
    constructor(
        private readonly eventEmitter: EventEmitter2,
        private readonly entityManager: EntityManager,
        private readonly notification: NotificationEmitter,
        private readonly resetPasswordService: ResetPasswordService,
    ) {}

    @Post()
    @ApiOkResponse()
    @ApiBadRequestResponse()
    async invoke(@Req() req: Request, @Body() data: ResetPasswordInput): Promise<any> {
        const user = await this.entityManager.findOne(User, {}, { filters: { email: { value: data.username } } });
        if (!user || user.deletedAt) {
            throw new HttpException('The email is invalid', HttpStatus.BAD_REQUEST);
        }

        const code = await this.resetPasswordService.process(user);
        await this.notification.emit(
            ResetPasswordTokenNotification,
            {
                user,
                code,
            },
            req.user,
        );
        await this.eventEmitter.emitAsync(ResetPasswordRequestEvent.eventName, new ResetPasswordRequestEvent(user));

        return {};
    }
}
