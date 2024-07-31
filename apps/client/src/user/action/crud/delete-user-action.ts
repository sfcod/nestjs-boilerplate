import { Controller, Delete, HttpCode, HttpStatus, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { EntityManager } from '@mikro-orm/core';
import { RolesGuard } from '@libs/security';
import { User, UserRole } from '@libs/orm';
import { DeleteUserGuard } from '../../guard/delete-user.guard';
import { SOFT_DELETABLE_QUERY_FILTER } from '@libs/soft-delete';
import { DELETE_USER_DATA_QUEUE, QueueInputType, uuid } from '@libs/core';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@ApiTags('User')
@Controller(`api-client/users/${uuid('id')}`)
export class DeleteUserAction {
    constructor(
        private readonly em: EntityManager,
        @InjectQueue(DELETE_USER_DATA_QUEUE)
        private readonly deletePatientQueue: Queue<QueueInputType<typeof DELETE_USER_DATA_QUEUE>>,
    ) {}

    @UseGuards(AuthGuard(['jwt', 'jwt-guest']), RolesGuard(UserRole.ROLE_USER), DeleteUserGuard)
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiBearerAuth()
    @ApiUnauthorizedResponse()
    @ApiForbiddenResponse()
    @ApiNotFoundResponse()
    @ApiNoContentResponse()
    async invoke(@Param('id') id: string): Promise<void> {
        const user = await this.em.findOneOrFail(User, id, {
            filters: { [SOFT_DELETABLE_QUERY_FILTER]: false },
        });

        await this.deletePatientQueue.add(DELETE_USER_DATA_QUEUE, { user: user.id });
    }
}
