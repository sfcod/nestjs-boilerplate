import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
    ApiOkResponse,
    ApiTags,
    ApiBearerAuth,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { User } from '@libs/orm';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@libs/security';
import { UserRole } from '@libs/orm';
import { GetUserGuard } from '../../guard/get-user.guard';
import { Mapper, uuid } from '@libs/core';
import { UserOutput } from '../../dto/output/user-output';

@ApiTags('User')
@Controller(`api-client/users/${uuid('id')}`)
export class GetUserAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @Get()
    @UseGuards(AuthGuard(['jwt-guest', 'jwt']), RolesGuard(UserRole.ROLE_USER), GetUserGuard)
    @ApiOkResponse({ type: UserOutput })
    @ApiBearerAuth()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    async invoke(@Param('id') id: string) {
        const user = await this.em.findOneOrFail(User, { id });

        return this.mapper.map(UserOutput, user);
    }
}
