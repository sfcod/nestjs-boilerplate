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
import { AdminRole, User } from '@libs/orm';
import { Paginator } from '@libs/core';
import { ClearMissingPropertiesPipe } from '@libs/core';
import { ApiDescription } from '@libs/core';
import { Mapper } from '@libs/core';
import { UserListOutput } from '../../dto/output/user-list-output';
import { FilterUserInput } from '../../dto/input/filter-user-input';

const ALLOWED_ROLES = [AdminRole.ROLE_SYSTEM_ADMIN];

@ApiTags('User')
@Controller('api-admin/users')
export class ListUserAction {
    constructor(
        private readonly paginator: Paginator,
        private readonly mapper: Mapper,
    ) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(...ALLOWED_ROLES))
    @Get()
    @ApiOkResponse({ type: [UserListOutput] })
    @ApiDescription({ summary: 'Get list of users', roles: ALLOWED_ROLES })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(
        @Query(new ClearMissingPropertiesPipe()) { page, limit, sort, name, ...query }: FilterUserInput,
    ): Promise<UserListOutput[]> {
        const users = await this.paginator.paginate<User>(User, query, sort, page, limit, {
            filters: name ? { name: { value: name } } : {},
        });

        return this.mapper.map<UserListOutput, User>(UserListOutput, users);
    }
}
