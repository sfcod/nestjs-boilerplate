import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { RolesGuard } from '@libs/security';
import { AccessKey, AdminRole } from '@libs/orm';
import { AccessKeyOutput } from '../../dto/output/access-key-output';
import { Mapper, uuid } from '@libs/core';
import { EntityManager } from '@mikro-orm/core';

@ApiTags('AccessKey')
@Controller(`api-admin/access-keys/${uuid('id')}`)
export class GetAccessKeyAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(AdminRole.ROLE_SYSTEM_ADMIN))
    @Get()
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(AccessKeyOutput) },
    })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    async invoke(@Request() req, @Param('id') id: string): Promise<AccessKeyOutput> {
        const accessKey = await this.em.getRepository(AccessKey).findOneOrFail(id);

        return this.mapper.map(AccessKeyOutput, accessKey);
    }
}
