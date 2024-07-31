import { Type } from '@mikro-orm/core';

export class Decimal extends Type<number, any> {
    constructor(
        private readonly precision = 10,
        private readonly scale = 2,
    ) {
        super();
    }

    convertToDatabaseValue(value): any {
        return value === null ? value : Number(value).toFixed(this.scale);
    }

    convertToJSValue(value): number {
        return Number(value);
    }

    getColumnType(): string {
        return `decimal(${this.precision}, ${this.scale})`;
    }
}
