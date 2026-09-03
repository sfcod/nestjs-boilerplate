import { MikroORM, RequestContext } from '@mikro-orm/core';

/**
 * Repeats the logic of the original mikro-orm @UseRequestContext() decorator, but also returns a result of the decorated function
 */
export function UseRequestContext() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const context: any = this;

            if (!(context.orm instanceof MikroORM)) {
                throw new Error(
                    '@UseRequestContext() decorator can only be applied to methods of classes that carry `orm: MikroORM`',
                );
            }
            let result;

            await RequestContext.create(context.orm.em, async () => {
                result = await originalMethod.apply(context, args);
            });

            return result;
        };

        return descriptor;
    };
}
