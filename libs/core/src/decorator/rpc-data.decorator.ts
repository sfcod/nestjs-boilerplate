import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';

/**
 * Use in Rpc action to validate data
 */
export const RpcData = createParamDecorator(async (data: any, ctx: ExecutionContext) => {
    if (data) {
        const errors = await validate(plainToClass(data, ctx.getArgByIndex(0)));

        const errorsToMessage = (errors: ValidationError[]) => {
            return errors.reduce(
                (previousValue, { property, constraints, children }) => ({
                    ...previousValue,
                    [property]: constraints ? Object.values(constraints).pop() : errorsToMessage(children),
                }),
                {},
            );
        };

        if (errors.length) {
            throw new RpcException({
                status: 'error',
                message: errorsToMessage(errors),
            });
        }
    }

    return ctx.getArgByIndex(0);
});
