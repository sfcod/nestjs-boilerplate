import { CallHandler, ExecutionContext, NestInterceptor, PayloadTooLargeException, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { FileInterceptor as BaseFileInterceptor } from '@nestjs/platform-express';
import { tap } from 'rxjs/operators';
import { unlink } from 'fs-extra';
import { existsSync } from 'fs';

type Options = MulterOptions & {
    messages?: {
        fileSize?: string;
    };
};

export function FileInterceptor(fieldName: string, { messages, ...localOptions }: Options = {}): Type<NestInterceptor> {
    const interceptor = BaseFileInterceptor(fieldName, localOptions);
    const originalInterceptMethod = interceptor.prototype.intercept;

    interceptor.prototype.intercept = async function (
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<any>> {
        try {
            await originalInterceptMethod.call(this, context, next);
            const request = context.switchToHttp().getRequest();
            const removeTmpFile = async () => {
                const file = request[fieldName];
                if (file?.path && existsSync(file?.path)) {
                    try {
                        await unlink(file?.path);
                    } catch (e) {}
                }
            };

            return next.handle().pipe(
                tap({
                    next: removeTmpFile,
                    error: removeTmpFile,
                }),
            );
        } catch (e) {
            if (e instanceof PayloadTooLargeException && messages?.fileSize) {
                throw new PayloadTooLargeException(messages.fileSize);
            }

            throw e;
        }
    };

    return interceptor;
}
