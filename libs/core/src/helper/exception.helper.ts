import { HttpStatus, Logger, ValidationError } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { RpcException } from '@nestjs/microservices';

export const validationHttpExceptionFactory = (validationErrors?: ValidationError[], parentProperty = '') => {
    let resultErrors = [];

    for (const error of validationErrors) {
        const errorProp = parentProperty ? `${parentProperty}.${error.property}` : error.property;
        if (error.children?.length) {
            resultErrors = [
                ...resultErrors,
                ...(validationHttpExceptionFactory(error.children, errorProp) as Array<any>),
            ];
        }

        if (error.constraints) {
            resultErrors.push({
                value: error.value,
                property: errorProp,
                constraints: error.constraints,
            });
        }
    }

    return parentProperty ? resultErrors : new HttpErrorByCode[HttpStatus.BAD_REQUEST](resultErrors);
};

export const validationRpcExceptionFactory = (validationErrors?: ValidationError[], parentProperty = '') => {
    let resultErrors = [];

    for (const error of validationErrors) {
        const errorProp = parentProperty ? `${parentProperty}.${error.property}` : error.property;
        if (error.children?.length) {
            resultErrors = [
                ...resultErrors,
                ...(validationHttpExceptionFactory(error.children, errorProp) as Array<any>),
            ];
        }

        if (error.constraints) {
            resultErrors.push({
                value: error.value,
                property: errorProp,
                constraints: error.constraints,
            });
        }
    }

    if (parentProperty) {
        return resultErrors;
    } else {
        const isDev = process.env.NODE_ENV === 'development';
        const logger = new Logger('ValidationRpcExceptionFactory');
        const exception = new RpcException({
            message: resultErrors,
            error: 'Bad Request',
        });
        isDev && logger.error(exception.message, resultErrors);

        return exception;
    }
};
