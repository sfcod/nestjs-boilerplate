import { Controller, Get } from '@nestjs/common';
import {
    AdminRole,
    AdminStatus,
    NotificationStatus,
    NotificationType,
    UserGender,
    UserRole,
    UserStatus,
} from '@libs/orm';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JsonOutput } from '@libs/core';
import { orderBy } from 'lodash';

@ApiTags('Enumerable')
@Controller('api-admin/enums')
export class EnumListAction {
    @Get()
    @ApiResponse({
        status: 200,
        description: 'Retrieves the Enums resource.',
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: {
                                type: 'string',
                                description: 'Key/value',
                            },
                            value: {
                                oneOf: [
                                    {
                                        type: 'string',
                                    },
                                    {
                                        type: 'number',
                                    },
                                ],
                                example: 'string|number',
                            },
                        },
                    },
                    description: 'Enum class name',
                },
            },
        },
    })
    async invoke(): Promise<any> {
        return new JsonOutput({
            [UserRole.name]: this.format(UserRole.getReadableValues()),
            [AdminRole.name]: this.format(AdminRole.getReadableValues()),
            [UserStatus.name]: this.format(UserStatus.getReadableValues()),
            [AdminStatus.name]: this.format(AdminStatus.getReadableValues()),
            [UserGender.name]: this.format(UserGender.getReadableValues()),
            [NotificationStatus.name]: this.format(NotificationStatus.getReadableValues()),
            [NotificationType.name]: this.format(NotificationType.getReadableValues()),
        });
    }

    private format(list: any, sorting?: any[]) {
        if (sorting) {
            return orderBy(
                Object.keys(list).map((key: string) => {
                    return {
                        name: list[key],
                        value: key,
                        sort: sorting.indexOf(key) + 1,
                    };
                }),
                'sort',
            );
        }

        return Object.keys(list).map((key: string) => {
            return {
                name: list[key],
                value: key,
            };
        });
    }
}
