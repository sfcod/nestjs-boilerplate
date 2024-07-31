import { Type } from '@mikro-orm/core';
import { RelatedReference } from './related-reference';

export class RelatedRefUuid extends Type<any, any> {
    convertToDatabaseValue(value: any): any {
        switch (true) {
            case value instanceof RelatedReference:
                return value.toString();
            case value?.hasOwnProperty('id'):
                return value.id;
            default:
                return value;
        }
    }

    convertToJSValue(value): any {
        return value;
    }

    getColumnType(): string {
        return 'uuid';
    }

    compareAsType(): string {
        return 'uuid';
    }
}
