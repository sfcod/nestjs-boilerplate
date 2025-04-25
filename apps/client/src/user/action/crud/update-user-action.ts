import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConsumes,
    ApiForbiddenResponse,
    ApiOkResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { User, UserAttribute, UserAttributeName, UserRole } from '@libs/orm';
import { UpdateUserInput } from '../../dto/input/update-user-input';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@libs/security';
import { ClearMissingPropertiesPipe, Mapper, uuid } from '@libs/core';
import { UpdateUserGuard } from '../../guard/update-user.guard';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';
import { UserOutput } from '../../dto/output/user-output';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller(`api-client/users/${uuid('id')}`)
export class UpdateUserAction {
    constructor(
        private readonly em: EntityManager,
        private readonly mapper: Mapper,
    ) {}

    @Patch()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard('jwt'), RolesGuard(UserRole.ROLE_USER), UpdateUserGuard)
    @ApiOkResponse({ type: UserOutput })
    @ApiBearerAuth()
    @ApiBadRequestResponse()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    async invoke(
        @Body(new ClearMissingPropertiesPipe())
        { password, timezone, ...data }: UpdateUserInput,
        @Param('id') id: string,
    ) {
        const user = await this.em.findOneOrFail(User, id, {
            filters: { [SOFT_DELETABLE_QUERY_FILTER]: false },
        });

        this.em.assign(user, data);

        user.setPlainPassword(password);
        await this.updateAttribute(user, UserAttributeName.TIMEZONE, timezone);

        await this.em.persistAndFlush(user);

        return this.mapper.map(UserOutput, user);
    }

    private async updateAttribute<T = any>(user: User, name: string, value: T) {
        if (value === undefined) {
            return;
        }

        let userAttribute = await this.em.findOne(UserAttribute, { user, name });

        if (!userAttribute) {
            userAttribute = new UserAttribute<T>(user);
        }
        this.em.assign(userAttribute, { name, value });

        this.em.persist(userAttribute);
    }
}
