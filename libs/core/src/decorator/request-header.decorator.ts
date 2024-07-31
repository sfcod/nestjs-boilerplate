import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

export const RequestHeader = createParamDecorator(async (value: any, ctx: ExecutionContext) => {
    // extract headers
    const headers = ctx.switchToHttp().getRequest().headers;

    // Convert headers to DTO object
    const dto = plainToClass(value, headers, { excludeExtraneousValues: true });

    // Validate
    const errors = await validate(dto);
    if (errors.length) {
        throw new BadRequestException(errors);
    }
    // return header dto object
    return dto;
});
