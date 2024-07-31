import { Expose } from 'class-transformer';

@Expose()
export class JsonOutput<T = any> {
    constructor(data: T, deep = true) {
        Object.assign(this, data);
        if (deep) {
            this.getDeepKeys(this);
        }
    }

    getDeepKeys(obj: any) {
        for (const key in obj) {
            if (obj[key] && obj[key] instanceof Date) {
                continue;
            } else if (obj[key] && obj[key].constructor.name == 'Array') {
                this.getDeepKeys(obj[key]);
            } else if (obj[key] && typeof obj[key] === 'object') {
                this.getDeepKeys(obj[key]);
                obj[key] = new JsonOutput(obj[key], false);
            }
        }
    }
}
