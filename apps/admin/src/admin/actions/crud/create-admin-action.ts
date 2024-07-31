import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { RolesGuard } from '@libs/security';
import { CreateAdminInput } from '../../dto/input/create-admin-input';
import { Admin, AdminRole } from '@libs/orm';
import { Mapper } from '@libs/core';
import { AdminOutput } from '../../dto/output/admin-output';
import { ApiDescription } from '@libs/core';
import { NotificationEmitter } from '@libs/notification';
import { AdminCreatedByAdminNotification } from '../../notification/admin-created-by-admin-notification';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('Admin')
@Controller('api-admin/admins')
export class CreateAdminAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
        private readonly notification: NotificationEmitter,
    ) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @Post()
    @ApiCreatedResponse({ type: AdminOutput })
    @ApiDescription({ summary: 'Create admin', roles: ALLOWED_ROLES })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(
        @Body() { password: manualPassword, ...rest }: CreateAdminInput,
        @Req() request: any,
    ): Promise<AdminOutput> {
        const admin = new Admin();
        const password = manualPassword || Math.random().toString(36).slice(2, 8);

        admin.setPlainPassword(password);
        Object.assign(admin, rest);

        await this.em.persistAndFlush(admin);

        await this.notification.emit(
            AdminCreatedByAdminNotification,
            {
                user: admin,
                password: password,
            },
            request.user,
        );

        return this.mapper.map(AdminOutput, admin);
    }
}
