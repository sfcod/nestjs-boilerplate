import { ValidationArguments, ValidatorConstraint } from 'class-validator';
import { PasswordValidation as BasePasswordValidation } from 'class-validator-password-check';

@ValidatorConstraint({ name: 'passwordValidation', async: false })
export class PasswordValidation extends BasePasswordValidation {
    /**
     * Overwrite base method to fix spelling.
     * (fixed version is not presented in npm registry)
     */
    defaultMessage(args: ValidationArguments) {
        return super.defaultMessage(args).replace('conatin', 'contain') as ReturnType<
            BasePasswordValidation['defaultMessage']
        >;
    }
}
