import { AnyEntity, EntityFieldMap } from '../types/entity';

export interface DirectoryNamerInterface {
    directoryName(object: AnyEntity, item: EntityFieldMap): Promise<string>;
}
