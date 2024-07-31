import { DirectoryNamerInterface } from '../naming/directory-namer.interface';
import { Type } from '@nestjs/common';
import { FileNamerInterface } from '../naming/file-namer.interface';

export type Mapping = {
    directoryNamer: Type<DirectoryNamerInterface>;
    fileNamer: Type<FileNamerInterface>;
    driver: string;
    prefix?: string;
    options?: {
        signed: boolean;
        expiry: number;
    };
};

export type EntityFieldMap = {
    fileNameProperty: string;
    mimeTypeProperty?: string;
    filePathProperty?: string;
    mapping: string;
};

export type AnyEntity = {
    [key: string]: any;
};
