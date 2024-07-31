import { Controller, Delete, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { RolesGuard } from '@libs/security';
import { AdminRole, Admin } from '@libs/orm';
import { ApiDescription, uuid } from '@libs/core';
import { DeleteAdminGuard } from '../../guard/delete-admin.guard';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('Admin')
@Controller(`api-admin/admins/${uuid('id')}`)
export class DeleteAdminAction {
    constructor(private readonly em: EntityManager) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES), DeleteAdminGuard)
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiDescription({ summary: 'Delete admin', roles: ALLOWED_ROLES })
    @ApiNoContentResponse()
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    async invoke(@Param('id') id: string): Promise<void> {
        const admin = await this.em.getRepository(Admin).findOneOrFail(id);

        await this.em.removeAndFlush(admin);
    }
}
