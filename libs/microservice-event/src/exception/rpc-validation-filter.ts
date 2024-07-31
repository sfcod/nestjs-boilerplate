import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Catch(HttpException)
export class RpcValidationFilter implements ExceptionFilter {
    protected readonly logger = new Logger(this.constructor.name);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    catch(exception: HttpException, host: ArgumentsHost) {
        if (exception.hasOwnProperty('response')) {
            const res: any = exception.getResponse();
            const rpcException = new RpcException(res.error);
            Object.keys(res)
                .filter((key) => ['statusCode'].includes(key) === false)
                .map((key) => {
                    rpcException[key] = res[key];
                });
            const isDev = process.env.NODE_ENV === 'development';
            isDev && this.logger.error(rpcException.message, rpcException);

            throw rpcException;
        }
        throw exception;
    }
}
