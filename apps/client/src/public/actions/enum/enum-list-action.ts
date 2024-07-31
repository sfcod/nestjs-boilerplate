import { Controller, Get } from '@nestjs/common';
import { UserGender, UserRole } from '@libs/orm';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { JsonOutput } from '@libs/core';
import { orderBy } from 'lodash';

@ApiTags('Enumerable')
@Controller('api-client/enums')
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
            [UserGender.name]: this.format(UserGender.getReadableValues()),
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
