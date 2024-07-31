import { AnyEntity } from '../types/entity';
import { Express } from 'express';

export interface FileNamerInterface {
    fileName(object: AnyEntity, original: Express.Multer.File): Promise<string>;
}
