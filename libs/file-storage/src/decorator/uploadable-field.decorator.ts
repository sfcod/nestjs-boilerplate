import { entityMeta } from '../service/entity-meta';
import { EntityFieldMap } from '../types/entity';

export function UploadableField(item: EntityFieldMap) {
    return function (target: any, propertyKey: string) {
        entityMeta.setFieldMap(target, propertyKey, item);
    };
}
