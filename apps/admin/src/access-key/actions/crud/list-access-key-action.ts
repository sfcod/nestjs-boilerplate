import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { ClearMissingPropertiesPipe, Mapper, Paginator } from '@libs/core';
import { RolesGuard } from '@libs/security';
import { AccessKey, AdminRole } from '@libs/orm';
import { AuthGuard } from '@nestjs/passport';
import { FilterAccessKeyInput } from '../../dto/input/filter-access-key-input';
import { AccessKeyOutput } from '../../dto/output/access-key-output';

@ApiTags('AccessKey')
@Controller('api-admin/access-keys')
export class ListAccessKeyAction {
    constructor(
        private readonly paginator: Paginator,
        private readonly mapper: Mapper,
    ) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard(AdminRole.ROLE_SYSTEM_ADMIN))
    @Get()
    @ApiOkResponse({
        schema: {
            type: 'array',
            items: { $ref: getSchemaPath(AccessKeyOutput) },
        },
    })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(
        @Request() req,
        @Query(new ClearMissingPropertiesPipe()) { page, limit, sort, ...query }: FilterAccessKeyInput,
    ): Promise<any> {
        const filters = {};

        const accessKeys = await this.paginator.paginate<AccessKey>(AccessKey, query, sort, page, limit, {
            // populate: ['owner'],
            filters: filters,
        });

        return this.mapper.map(AccessKeyOutput, accessKeys);
    }
}
