import { Body, Controller, HttpCode, HttpStatus, Param, Patch, UseFilters, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager, wrap } from '@mikro-orm/core';
import { AdminRole, User } from '@libs/orm';
import { UpdateUserInput } from '../../dto/input/update-user-input';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@libs/security';
import { ApiDescription, ClearMissingPropertiesPipe, Mapper, TimeoutExceptionFilter, uuid } from '@libs/core';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';
import { UserDetailOutput } from '../../dto/output/user-detail-output';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('User')
@Controller(`api-admin/users/${uuid('id')}`)
export class UpdateUserAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @Patch()
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @ApiDescription({ roles: ALLOWED_ROLES, summary: 'Update user' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiOkResponse({ type: UserDetailOutput })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    @UseFilters(new TimeoutExceptionFilter())
    async invoke(
        @Body(new ClearMissingPropertiesPipe())
        { password, ...data }: UpdateUserInput,
        @Param('id') id: string,
    ) {
        const user = await this.em.findOneOrFail(User, id, {
            filters: { [SOFT_DELETABLE_QUERY_FILTER]: false },
        });

        wrap(user).assign(data);
        user.setPlainPassword(password);
        await this.em.flush();

        return this.mapper.map(UserDetailOutput, user);
    }
}
