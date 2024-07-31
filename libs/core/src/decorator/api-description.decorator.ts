import { applyDecorators } from '@nestjs/common';
import { ApiOperationOptions, ApiOperation as BaseApiOperation } from '@nestjs/swagger';

const formatRole = (role: string) => {
    return role
        .split('_')
        .map((word) => {
            if (word === 'ROLE') return '';

            return word.charAt(0) + word.substring(1).toLowerCase();
        })
        .join(' ');
};

type Options = ApiOperationOptions & {
    roles?: string[];
};

export const ApiDescription = (options: Options) => {
    const { roles, ...opts } = options;

    if (roles && roles.length) {
        const rolesFormatted = roles.map(formatRole);
        opts['description'] = `<b>Allowed roles:</b> ${rolesFormatted}. <br/> <br/>${opts['description'] || ''}`;
    }

    return applyDecorators(BaseApiOperation(opts));
};
