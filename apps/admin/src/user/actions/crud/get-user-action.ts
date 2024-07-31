import { Controller, Get, Inject, Param, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminRole, User } from '@libs/orm';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@libs/security';
import { ApiDescription, Mapper, TimeoutExceptionFilter, uuid } from '@libs/core';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';
import { EntityManager } from '@mikro-orm/core';
import { UserDetailOutput } from '../../dto/output/user-detail-output';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('User')
@Controller(`api-admin/users/${uuid('id')}`)
export class GetUserAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @ApiDescription({ roles: ALLOWED_ROLES, summary: 'Get user' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiOkResponse({ type: UserDetailOutput })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @UseFilters(new TimeoutExceptionFilter())
    async invoke(@Param('id') id: string) {
        const user = await this.em.findOneOrFail(User, { id }, { filters: { [SOFT_DELETABLE_QUERY_FILTER]: false } });

        return this.mapper.map(UserDetailOutput, user);
    }
}
