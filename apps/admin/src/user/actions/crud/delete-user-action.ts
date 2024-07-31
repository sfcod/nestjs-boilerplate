import { Controller, Delete, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { RolesGuard } from '@libs/security';
import { AdminRole, User } from '@libs/orm';
import { ApiDescription, uuid } from '@libs/core';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('User')
@Controller(`api-admin/users/${uuid('id')}`)
export class DeleteUserAction {
    constructor(private readonly em: EntityManager) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiDescription({ roles: ALLOWED_ROLES, summary: 'Delete user' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiNoContentResponse()
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    async invoke(@Param('id') id: string): Promise<any> {
        const user = await this.em.findOneOrFail(User, id);

        await this.em.removeAndFlush(user);
    }
}
