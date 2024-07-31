import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiTags,
    ApiUnauthorizedResponse,
    getSchemaPath,
} from '@nestjs/swagger';
import { RolesGuard } from '@libs/security';
import { AccessKey, AdminRole } from '@libs/orm';
import { AccessKeyManager } from '@libs/access-key/service/access-key-manager';
import { AccessKeyOutput } from '../../dto/output/access-key-output';
import { Mapper, Output } from '@libs/core';
import { CreateAccessKeyInput } from '../../dto/input/create-access-key-input';
import { AccessKeyCreatedOutput } from '../../dto/output/access-key-created-output';
import { EntityManager } from '@mikro-orm/core';

@ApiTags('AccessKey')
@Controller('api-admin/access-keys')
export class CreateAccessKeyAction {
    constructor(
        private readonly em: EntityManager,
        private readonly generateKey: AccessKeyManager,
        private readonly output: Output,
        private readonly mapper: Mapper,
    ) {}

    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard('jwt'), RolesGuard(AdminRole.ROLE_SYSTEM_ADMIN))
    @Post()
    @ApiCreatedResponse({
        schema: { $ref: getSchemaPath(AccessKeyCreatedOutput) },
    })
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiBadRequestResponse()
    async invoke(@Request() req, @Body() { permissions, ...body }: CreateAccessKeyInput): Promise<AccessKeyOutput> {
        const accessKey = new AccessKey(req.user);
        this.em.assign(accessKey, body);
        accessKey.setPermissions(permissions);
        const data = await this.generateKey.generate();
        accessKey.key = data.hashedKey;
        accessKey.salt = data.salt;

        await this.em.persistAndFlush(accessKey);

        const output = await this.mapper.map(AccessKeyCreatedOutput, accessKey);
        output.key = data.openedKey;

        return output;
    }
}
