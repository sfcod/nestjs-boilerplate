import { ArgumentMetadata, PipeTransform, ValidationError } from '@nestjs/common';
import { validationRpcExceptionFactory } from '../helper/exception.helper';
import { RpcException } from '@nestjs/microservices';

export abstract class AbstractRpcValidationPipe<T = any> implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async transform(value: T, metadata: ArgumentMetadata): Promise<T> {
        let errors: ValidationError[] = [];

        try {
            errors = await this.validate(value);
        } catch (e) {
            throw new RpcException(e.message);
        }

        if (errors.length) {
            throw validationRpcExceptionFactory(errors);
        }

        return value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async validate(data: T): Promise<ValidationError[]> {
        throw new Error('Validation method should be implemented');
    }
}
