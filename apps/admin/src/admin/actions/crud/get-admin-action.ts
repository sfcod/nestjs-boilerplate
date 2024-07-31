import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@libs/security';
import { AdminRole } from '@libs/orm';
import { EntityManager } from '@mikro-orm/core';
import { AdminOutput } from '../../dto/output/admin-output';
import { Mapper, uuid } from '@libs/core';
import { ApiDescription } from '@libs/core';
import { Admin } from '@libs/orm';
import { GetAdminGuard } from '../../guard/get-admin.guard';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('Admin')
@Controller(`api-admin/admins/${uuid('id')}`)
export class GetAdminAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @UseGuards(AuthGuard(['jwt-guest', 'jwt']), RolesGuard(...ALLOWED_ROLES), GetAdminGuard)
    @Get()
    @ApiOkResponse({ type: AdminOutput })
    @ApiDescription({ summary: 'Get admin', roles: ALLOWED_ROLES })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiParam({ name: 'id', type: 'string' })
    async invoke(@Param('id') id: string): Promise<any> {
        return this.mapper.map(AdminOutput, await this.em.getRepository(Admin).findOneOrFail(id));
    }
}
