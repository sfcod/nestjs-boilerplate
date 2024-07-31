import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { trim } from 'lodash';
import { path as appRoot } from 'app-root-path';
import urlConfig from '../../../../config/url.config';
import * as moment from 'moment';
import * as process from 'process';

export const inlineStyle = (file: string) => {
    const filePath = join(appRoot, `/templates/assets/${trim(file, '/')}.css`);
    if (existsSync(filePath)) {
        return readFileSync(filePath, 'utf8');
    }

    throw new Error(`Css file ${filePath} does not exist`);
};

export const partialExists = (path: string) => {
    const filePath = join(appRoot, `/templates/partials/${trim(path, '/')}.hbs`);

    return existsSync(filePath);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const adminPanelUrl = (path: string, params?: any) => {
    path = trim(path, '/');
    return `${trim(urlConfig.adminPanelUrl, '/')}${path ? join('/', path) : ''}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const frontendUrl = (path: string, params?: any) => {
    path = trim(path, '/');
    return `${trim(urlConfig.frontendUrl, '/')}${path ? join('/', path) : ''}`;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const apiUrl = (path: string, params?: any) => {
    path = trim(path, '/');
    return `${trim(urlConfig.apiUrl, '/')}${path ? join('/', path) : ''}`;
};

export const concat = (...args: any) => {
    return args.slice(0, args.length - 1).join('');
};

export function ifEqual(a: any, b: any, options: any) {
    return a == b ? options.fn(this) : options.inverse(this);
}
export function ifNotEqual(a: any, b: any, options: any) {
    return a == b ? options.inverse(this) : options.fn(this);
}

export function ifOr(...args: any[]) {
    const options = args.pop();
    return args.some(Boolean) ? options.fn(this) : options.inverse(this);
}
export function ifAnd(...args: any[]) {
    const options = args.pop();
    return args.every(Boolean) ? options.fn(this) : options.inverse(this);
}

export const secondsToReadable = (seconds: number): string => {
    return moment.utc(seconds * 1000).format('mm:ss');
};

export const increment = (value: number): number => {
    return value + 1;
};

export const unsubscribeUrl = (email: string, hash: string) => {
    return frontendUrl(`/email/unsubscribe?email=${encodeURIComponent(email)}&hash=${hash}`);
};
