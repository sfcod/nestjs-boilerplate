import { File } from './file.interface';
import { Request } from 'express';

export interface FileValidator {
    validate(file: File, request: Request, eventType?: string): Promise<string | null>;
}
