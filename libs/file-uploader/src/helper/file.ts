import { stat } from 'fs';
import { promisify } from 'util';
import { File } from '../contract/file.interface';
import { basename } from 'path';

const statAsync = promisify(stat);

export const pathToFile = async (path: string): Promise<File> => {
    const stat = await statAsync(path);

    return {
        originalname: basename(path),
        mimetype: '',
        size: stat.size,
        path: path,
    };
};
