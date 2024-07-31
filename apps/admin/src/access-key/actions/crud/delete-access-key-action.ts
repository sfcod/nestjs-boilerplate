import { Controller, Delete, HttpCode, HttpStatus, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { RolesGuard } from '@libs/security';
import { AccessKey, AdminRole } from '@libs/orm';
import { AccessKeyOutput } from '../../dto/output/access-key-output';
import { uuid } from '@libs/core';

@ApiTags('AccessKey')
@Controller(`api-admin/access-keys/${uuid('id')}`)
export class DeleteAccessKeyAction {
    constructor(private readonly em: EntityManager) {}

    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(AuthGuard('jwt'), RolesGuard(AdminRole.ROLE_SYSTEM_ADMIN))
    @Delete()
    @ApiNoContentResponse({
        schema: { $ref: getSchemaPath(AccessKeyOutput) },
    })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    async invoke(@Request() req, @Param('id') id: string): Promise<void> {
        const accessKey: AccessKey = await this.em.getRepository(AccessKey).findOneOrFail(id);

        await this.em.removeAndFlush(accessKey);
    }
}
