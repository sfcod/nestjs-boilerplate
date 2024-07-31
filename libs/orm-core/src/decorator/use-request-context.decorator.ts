import { MikroORM, RequestContext } from '@mikro-orm/core';

// @TODO: There is new @CreateRequestContext decorator in newer version of mikro-orm. Probably it fits our needs and we dont need our custom decorator anymore.
/**
 * Repeats the logic of original mikro-orm @UseRequestContext() decorator, but also returns a result of decorated function
 */
export function UseRequestContext() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const context: any = this;

            if (!(context.orm instanceof MikroORM) && !(context.orm instanceof Array)) {
                throw new Error(
                    '@UseRequestContext() decorator can only be applied to methods of classes that carry `orm: MikroORM`',
                );
            }
            let result;

            await RequestContext.createAsync(
                context.orm instanceof Array ? context.orm.map((orm) => orm.em) : context.orm.em,
                async () => {
                    result = await originalMethod.apply(context, args);
                },
            );

            return result;
        };

        return descriptor;
    };
}
