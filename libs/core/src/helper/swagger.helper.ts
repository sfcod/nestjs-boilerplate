import { resolve } from 'path';
import { GlobOptionsWithFileTypesFalse, sync } from 'glob';

export const names = async (globPattern: string, options?: GlobOptionsWithFileTypesFalse) => {
    const all = await Promise.all(
        sync(globPattern, options).map((file: string) => {
            return import(resolve(file));
        }),
    );

    return all.map((module) => {
        return Object.values(module)[0] as any;
    });
};
