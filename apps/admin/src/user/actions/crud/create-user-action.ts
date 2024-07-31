import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager, wrap } from '@mikro-orm/core';
import { AdminRole, User, UserStatus } from '@libs/orm';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@libs/security';
import { NotificationEmitter } from '@libs/notification';
import { ApiDescription, ClearMissingPropertiesPipe, Mapper, TimeoutExceptionFilter } from '@libs/core';
import { CreateUserInput } from '../../dto/input/create-user-input';
import { UserDetailOutput } from '../../dto/output/user-detail-output';
import { UserProcessTemporaryPassword } from '../../service/user-process-temporary-password.service';
import { UserCreatedByAdminNotification } from '../../notification/user-created-by-admin-notification';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('User')
@Controller('api-admin/users')
export class CreateUserAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
        private readonly userProcessTemporaryPassword: UserProcessTemporaryPassword,
        private readonly notification: NotificationEmitter,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @ApiDescription({ roles: ALLOWED_ROLES, summary: 'Create user' })
    @ApiCreatedResponse({ type: UserDetailOutput })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    @UseFilters(new TimeoutExceptionFilter())
    async invoke(
        @Body(new ClearMissingPropertiesPipe())
        { password, status, ...data }: CreateUserInput,
        @Req() request,
    ) {
        const user = this.em.create(User, data);

        wrap(user).assign(data);
        user.setPlainPassword(password);
        user.status = status ?? UserStatus.STATUS_PENDING_PHONE_VERIFICATION;
        const tempPassword = await this.userProcessTemporaryPassword.process(user);

        this.em.persist(user);
        await this.em.flush();

        await this.notification.emit(UserCreatedByAdminNotification, { user, password: tempPassword }, request.user);

        return this.mapper.map(UserDetailOutput, user);
    }
}
