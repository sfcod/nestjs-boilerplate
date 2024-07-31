import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { CodeVerifyThrottleException } from './../exception/code-verify-throttle-exception';
import { CodeSendThrottleException } from './../exception/code-send-throttle-exception';
import { CodeAuthenticatorException } from './../exception/code-authenticator-exception';
import { InvalidPhoneNumberException } from '@libs/twilio';

@Catch(CodeSendThrottleException, CodeVerifyThrottleException, InvalidPhoneNumberException, CodeAuthenticatorException)
export class CodeAuthenticatorExceptionFilter implements ExceptionFilter {
    catch(
        exception: CodeSendThrottleException | CodeVerifyThrottleException | InvalidPhoneNumberException,
        host: ArgumentsHost,
    ): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status: number;
        let message: string;
        switch (true) {
            case exception instanceof CodeAuthenticatorException:
                status = HttpStatus.BAD_REQUEST;
                message = (exception as any).message;
                break;
            case exception instanceof CodeSendThrottleException:
            case exception instanceof CodeVerifyThrottleException:
                status = HttpStatus.TOO_MANY_REQUESTS;
                message = (exception as any).message;
                break;
            case exception instanceof InvalidPhoneNumberException:
                status = HttpStatus.BAD_REQUEST;
                message = 'Your current phone number format is incorrect. Please update it to proceed.';
                break;
        }

        response.status(status).json({
            statusCode: status,
            message,
        });
    }
}
