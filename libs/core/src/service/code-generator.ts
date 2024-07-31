import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class CodeGenerator {
    public generateHexString(length = 6, upperCase = false): string {
        let code = '';

        // for (let i = 0; i < length; i++) {
        //     code += Math.floor(Math.random() * 10);
        // }

        code = randomBytes(6).toString('hex').substr(0, length);

        return upperCase ? code.toUpperCase() : code;
    }

    public generateNumbersString(): string {
        const code = String(Math.floor(1000 + Math.random() * 9000));
        return code;
    }
}
