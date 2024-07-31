import patchMethod from 'patch-method';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { TransformOperationExecutor } from 'class-transformer/cjs/TransformOperationExecutor';

// FIXME: Workaround until: https://github.com/typestack/class-transformer/pull/262
patchMethod(
    TransformOperationExecutor,
    'transform',
    (transform, source, value: any, targetType, arrayType, isMap, level = 0) => {
        if (value && typeof value === 'object' && typeof value.then === 'function') {
            return value;
        }

        return transform(source, value, targetType, arrayType, isMap, level);
    },
);
