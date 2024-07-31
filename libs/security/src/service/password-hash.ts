import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordHash {
    public async hash(plainPassword: string, salt?: string): Promise<string> {
        return await bcrypt.hash(plainPassword, salt);
    }

    public compare(password, encrypted): Promise<boolean> {
        return bcrypt.compare(password, encrypted);
    }
}
