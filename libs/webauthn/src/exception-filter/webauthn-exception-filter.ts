import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { WebauthnException } from '../exception/webauthn-exception';

@Catch(WebauthnException)
export class WebauthnExceptionFilter implements ExceptionFilter {
    catch(exception: WebauthnException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        response.status(HttpStatus.BAD_REQUEST).json({
            status: 'error',
            message: exception.message,
        });
    }
}
