import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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
import { RolesGuard } from '@libs/security';
import { AdminRole, Admin } from '@libs/orm';
import { ApiDescription, uuid, ClearMissingPropertiesPipe, Mapper } from '@libs/core';
import { UpdateAdminInput } from '../../dto/input/update-admin-input';
import { AdminOutput } from '../../dto/output/admin-output';
import { UpdateAdminValidationPipe } from '../../pipe/update-admin-validation.pipe';

@ApiTags('Admin')
@Controller(`api-admin/admins/${uuid('id')}`)
export class UpdateAdminAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(AdminRole.ROLE_SYSTEM_ADMIN))
    @Patch()
    @ApiDescription({ roles: [AdminRole.ROLE_SYSTEM_ADMIN], summary: 'Update admin' })
    @ApiParam({ name: 'id', type: 'string' })
    @ApiOkResponse({ type: AdminOutput })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(
        @Param('id') id: string,
        @Body(UpdateAdminValidationPipe, new ClearMissingPropertiesPipe()) { password, ...rest }: UpdateAdminInput,
    ): Promise<AdminOutput> {
        const admin = await this.em.getRepository(Admin).findOneOrFail(id);

        wrap(admin).assign(rest);

        if (password) {
            admin.setPlainPassword(password);
        }

        await this.em.persistAndFlush(admin);

        return this.mapper.map(AdminOutput, admin);
    }
}
