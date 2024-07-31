import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '@libs/security';
import { AdminRole, Admin } from '@libs/orm';
import { Paginator } from '@libs/core';
import { ClearMissingPropertiesPipe } from '@libs/core';
import { AdminOutput } from '../../dto/output/admin-output';
import { ApiDescription } from '@libs/core';
import { AdminFilterInput } from '../../dto/input/admin-filter-input';
import { Mapper } from '@libs/core';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('Admin')
@Controller('api-admin/admins')
export class ListAdminAction {
    constructor(
        private readonly paginator: Paginator,
        private readonly mapper: Mapper,
    ) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @Get()
    @ApiOkResponse({ type: [AdminOutput] })
    @ApiDescription({ summary: 'Get list of admins', roles: ALLOWED_ROLES })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(
        @Query(new ClearMissingPropertiesPipe()) { page, limit, sort, ...query }: AdminFilterInput,
    ): Promise<AdminOutput[]> {
        const admins = await this.paginator.paginate<Admin>(Admin, query, sort, page, limit);

        return this.mapper.map<AdminOutput, Admin>(AdminOutput, admins);
    }
}
