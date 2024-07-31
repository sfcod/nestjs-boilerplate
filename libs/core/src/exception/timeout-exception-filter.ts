import { ArgumentsHost, Catch, ExceptionFilter, RequestTimeoutException } from '@nestjs/common';
import { TimeoutError } from 'rxjs';
import { Response } from 'express';

@Catch(TimeoutError)
export class TimeoutExceptionFilter implements ExceptionFilter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch(exception: TimeoutError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const error = new RequestTimeoutException();
        response.status(error.getStatus()).send(error.getResponse());
    }
}
