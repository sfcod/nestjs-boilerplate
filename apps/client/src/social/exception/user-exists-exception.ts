import { HttpException, HttpStatus } from '@nestjs/common';

export class UserExistsException extends HttpException {
    constructor(
        response: string | Record<string, any> = 'An account for the specified email address already exists.',
        status: number = HttpStatus.BAD_REQUEST,
    ) {
        super(response, status);
    }
}
