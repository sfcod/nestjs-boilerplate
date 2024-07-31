import { Request } from 'express';
import { File } from '../contract/file.interface';

export class UploadEvent {
    public static get eventName() {
        return `uploader.module.${UploadEvent.name}`;
    }

    constructor(
        public readonly file: File,
        public readonly request: Request,
        public readonly eventType?: string,
    ) {}
}
