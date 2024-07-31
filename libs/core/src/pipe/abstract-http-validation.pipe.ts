import { ArgumentMetadata, BadRequestException, PipeTransform, ValidationError } from '@nestjs/common';
import { validationHttpExceptionFactory } from '../helper/exception.helper';

export abstract class AbstractHttpValidationPipe<T = any> implements PipeTransform {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async transform(value: T, metadata: ArgumentMetadata): Promise<T> {
        let errors: ValidationError[] = [];

        try {
            errors = await this.validate(value);
        } catch (e) {
            throw new BadRequestException();
        }

        if (errors.length) {
            throw validationHttpExceptionFactory(errors);
        }

        return value;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async validate(data: T): Promise<ValidationError[]> {
        throw new Error('Validation method should be implemented');
    }
}
