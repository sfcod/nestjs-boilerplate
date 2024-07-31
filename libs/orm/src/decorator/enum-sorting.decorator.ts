export function EnumSortingDecorator(sorting: any[]) {
    return function <T extends { new (...args: any[]): Record<any, any> }>(constructor: T) {
        const c = class extends constructor {
            public static getValuesSorting() {
                // Even if JSON key looks like number, it is a string. JSON key can be only string.
                return sorting.map((item) => String(item));
            }

            public static getSorting(value: any) {
                return this.getValuesSorting().indexOf(value) + 1;
            }
        };
        Object.defineProperty(c, 'name', {
            writable: true,
            value: constructor.name,
        });

        return c;
    };
}
