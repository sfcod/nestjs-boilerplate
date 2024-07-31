import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs/operators';

export class AsyncSerializerInterceptor implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        return next.handle().pipe(
            map(async (data) => {
                return await this.format(data);
            }),
        );
    }

    private async format(obj): Promise<any> {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (value && typeof value === 'object' && typeof value.then === 'function') {
                    obj[key] = await value;
                } else if (value && typeof value == 'object') {
                    obj[key] = await this.format(obj[key]);
                }
            }
        }
        return obj;
    }
}
