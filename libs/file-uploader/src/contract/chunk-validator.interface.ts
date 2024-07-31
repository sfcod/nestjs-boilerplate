import { File } from './file.interface';
import { ParseChunkedRequest } from './parse-chunked-request.type';

export interface ChunkValidator {
    validate(file: File, request: ParseChunkedRequest, eventType?: string): Promise<string | null>;
}
