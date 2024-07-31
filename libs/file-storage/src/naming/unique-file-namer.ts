import { AnyEntity } from '../types/entity';
import { FileNamerInterface } from './file-namer.interface';
import { randomBytes } from 'crypto';
import { Express } from 'express';

/* eslint-disable prefer-const */
export class UniqueFileNamer implements FileNamerInterface {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async fileName(entity: AnyEntity, original: Express.Multer.File): Promise<string> {
        const name = randomBytes(6).toString('hex').substr(0, 10).toLowerCase();

        return `${name}__${original.originalname}`;
    }
}
