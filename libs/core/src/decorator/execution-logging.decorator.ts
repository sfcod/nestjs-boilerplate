import { Inject } from '@nestjs/common';
import { EXECUTION_LOGGER } from '../constant/service-constant';

/**
 * METHOD DECORATOR
 *
 * Add decorator after all method decorators (The last decorator from top to bottom).
 * @param message
 */
export function ExecutionLogging(message: string, options: { async: boolean } = { async: true }) {
    const injectLogger: any = Inject(EXECUTION_LOGGER);
    const { async } = options;
    return function (target: any, propertyKey: string, descriptor: any) {
        injectLogger(target, 'executionLogger');
        const isDev = process.env.NODE_ENV === 'development';
        const originalMethod = descriptor.value;
        if (isDev === false) {
            return descriptor;
        }

        descriptor.value = async
            ? async function (...args: any[]) {
                  this.executionLogger.debug(message);

                  return await originalMethod.apply(this, args);
              }
            : function (...args: any[]) {
                  this.executionLogger.debug(message);

                  return originalMethod.apply(this, args);
              };

        return descriptor;
    };
}
