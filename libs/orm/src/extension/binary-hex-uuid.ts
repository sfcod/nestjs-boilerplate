import { Type } from '@mikro-orm/core';
import { v4 } from 'uuid';

export class BinaryHexUuid extends Type<string, any> {
    convertToDatabaseValue(value): any {
        return value;
    }

    convertToJSValue(value): string {
        return value;
    }

    getColumnType(): string {
        return 'uuid';
    }

    compareAsType(): string {
        return 'string';
    }

    static getBinaryHexUuid(): string {
        return v4(); //.replace(/-/g, '');
    }
}
