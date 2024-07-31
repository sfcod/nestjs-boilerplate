import { ArgumentsHost, Catch, Logger, RpcExceptionFilter as IRpcExceptionFilter } from '@nestjs/common';
// import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class RpcExceptionFilter implements IRpcExceptionFilter<RpcException> {
    protected readonly logger = new Logger(this.constructor.name);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch(exception: RpcException, host: ArgumentsHost): any {
        this.logger.error(exception.message, exception);
        return exception; //throwError(() => exception.getError());
    }
}
