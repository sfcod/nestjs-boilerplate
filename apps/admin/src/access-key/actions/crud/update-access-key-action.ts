import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { RolesGuard } from '@libs/security';
import { AccessKey, AdminRole } from '@libs/orm';
import { AccessKeyOutput } from '../../dto/output/access-key-output';
import { ClearMissingPropertiesPipe, Mapper, uuid } from '@libs/core';
import { UpdateAccessKeyInput } from '../../dto/input/update-access-key-input';
import { wrap } from '@mikro-orm/core';

@ApiTags('AccessKey')
@Controller(`api-admin/access-keys/${uuid('id')}`)
export class UpdateAccessKeyAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'), RolesGuard(AdminRole.ROLE_SYSTEM_ADMIN))
    @Patch()
    @ApiOkResponse({
        schema: { $ref: getSchemaPath(AccessKeyOutput) },
    })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(
        @Request() req,
        @Param('id') id: string,
        @Body(new ClearMissingPropertiesPipe()) { permissions, ...data }: UpdateAccessKeyInput,
    ): Promise<AccessKeyOutput> {
        const accessKey: AccessKey = await this.em
            .getRepository(AccessKey)
            .findOneOrFail(id, { populate: ['permissions'] });

        wrap(accessKey).assign(data);
        permissions && accessKey.setPermissions(permissions);

        await this.em.persistAndFlush(accessKey);

        return this.mapper.map(AccessKeyOutput, accessKey);
    }
}
