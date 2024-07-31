import { FileValidator } from '../contract/file-validator.interface';
import { File } from '../contract/file.interface';
import { Request } from 'express';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FilesystemValidator implements FileValidator {
    public constructor(
        @Inject('ALLOWED_MIMETYPES') protected readonly fileTypes,
        @Inject('MAX_SIZE') protected readonly maxSize,
        @Inject('MIN_SIZE') protected readonly minSize,
        @Inject('ALLOWED_FORMATS') protected readonly fileFormats,
    ) {}

    async validate(file: File, request: Request, eventType?: string): Promise<string | null> {
        if (eventType && this.fileTypes[eventType]) {
            if (this.fileTypes[eventType].indexOf(file.mimetype) === -1) {
                return `Allowed file types: ${this.fileTypes[eventType].join(', ')}`;
            }
        }

        if (eventType && this.maxSize[eventType]) {
            if (file.size > this.maxSize[eventType]) {
                return `Max file size is ${this.maxSize[eventType]} bytes.`;
            }
        }

        if (eventType && this.minSize[eventType]) {
            if (file.size < this.minSize[eventType]) {
                return `Max file size is ${this.minSize[eventType]} bytes.`;
            }
        }

        if (eventType && this.fileFormats[eventType]) {
            const reg = new RegExp('.' + this.fileFormats[eventType].join('$|.') + '$');
            if (!reg.test(file.originalname)) {
                return `Allowed file formats: ${this.fileFormats[eventType].join(', ')}.`;
            }
        }

        return null;
    }
}
