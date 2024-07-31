import { PipeTransform } from '@nestjs/common';

export class ClearMissingPropertiesPipe implements PipeTransform {
    transform(value: any): number {
        for (const [objKey, objValue] of Object.entries(value)) {
            if (objValue === undefined) {
                delete value[objKey];
            }

            if (objValue instanceof Object) {
                value[objKey] = this.transform(objValue);
            }
        }

        return value;
    }
}
