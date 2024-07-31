import { isNumberString } from 'class-validator';

export abstract class AbstractValueEnum {
    protected static choices: { [key: string]: any } = {};

    public static getValueName(value: any) {
        return this.choices[value] || undefined;
    }

    public static getReadableValues() {
        return this.choices;
    }

    public static getValues() {
        return Object.keys(this.choices).map((key) => (isNumberString(key) ? +key : key));
    }
}
