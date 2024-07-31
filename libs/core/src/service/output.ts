import { Injectable, Type } from '@nestjs/common';

@Injectable()
export class Output {
    public dto<T, I = any>(dto: Type<T>, data: Partial<I>, map?: { [k in keyof T]: any }): T {
        const obj = Reflect.construct(dto, []);
        if (map) {
            for (const key in map) {
                obj[key as string] = data[map[key]];
            }
        } else {
            for (const key in data) {
                obj[key as string] = data[key];
            }
        }
        return obj;
    }

    public collection<T, I = any>(dto: Type<T>, data: Array<Partial<I>>, map?: { [k in keyof T]: any }): T[] {
        return data.map((item) => this.dto(dto, item, map));
    }
}
