import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class ChecksumProvider {
    private readonly secretKey: string = process.env.JWT_SECRET_KEY;

    generate(data: Record<any, any>, expiresIn: number = 60): string {
        const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;
        const payload = `${JSON.stringify(data)}-${expirationTime}`;
        const checksum = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');

        return `${expirationTime}-${checksum}`;
    }

    verify(data: Record<any, any>, checksum: string): boolean {
        const [expirationTime, originalChecksum] = checksum.split('-');
        if (parseInt(expirationTime, 10) < Math.floor(Date.now() / 1000)) {
            // Check if the checksum has expired
            return false;
        }
        const payload = `${JSON.stringify(data)}-${expirationTime}`;
        const expectedChecksum = crypto.createHmac('sha256', this.secretKey).update(payload).digest('hex');

        return originalChecksum === expectedChecksum;
    }
}
