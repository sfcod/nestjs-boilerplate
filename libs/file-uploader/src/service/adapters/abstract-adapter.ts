import { File } from '../../contract/file.interface';
import { Request } from 'express';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ValidationException } from '../../exception/validation.exception';
import { UploadEvent } from '../../event/upload.event';
import { FileValidator } from '../../contract/file-validator.interface';

export abstract class AbstractAdapter {
    protected constructor(
        protected readonly fileValidator: FileValidator,
        protected readonly eventEmitter: EventEmitter2,
    ) {}

    /**
     *  This function will be called in order to upload and save an
     *  uploaded file.
     */
    protected async handleUpload(file: File, request: Request, eventType?: string): Promise<any[]> {
        const error = await this.fileValidator.validate(file, request, eventType);
        if (error) {
            throw new ValidationException(error);
        }

        return await this.eventEmitter.emitAsync(
            `${UploadEvent.eventName}${eventType ? `.${eventType}` : ''}`,
            new UploadEvent(file, request, eventType),
        );
    }
}
