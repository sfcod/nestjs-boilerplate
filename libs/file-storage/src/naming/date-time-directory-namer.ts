import { DirectoryNamerInterface } from './directory-namer.interface';
import { snakeCase } from 'lodash';
import { join } from 'path';
import { AnyEntity, EntityFieldMap } from '../types/entity';

/* eslint-disable prefer-const */
export class DateTimeDirectoryNaming implements DirectoryNamerInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async directoryName(entity: AnyEntity, item: EntityFieldMap): Promise<string> {
        return join(snakeCase(entity.constructor.name), '/', this.formatDate(entity.createdAt));
    }

    private formatDate(date: string): string {
        return (typeof date === 'string' ? date : (date as any).toISOString()).substring(0, 10).split('-').join('/');
    }
}
