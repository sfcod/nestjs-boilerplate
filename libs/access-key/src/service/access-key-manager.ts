import { generate } from 'generate-password';
import { compare, hash, genSalt } from 'bcrypt';

export type GeneratedData = {
    hashedKey: string;
    openedKey: string;
    salt: string;
};

export class AccessKeyManager {
    public async generate(): Promise<GeneratedData> {
        const openedKey = generate({
            length: 60,
            lowercase: true,
            numbers: true,
            symbols: false,
            uppercase: true,
            strict: true,
            excludeSimilarCharacters: true,
        });
        const salt = await genSalt();

        const hashedKey = await hash(openedKey, salt);

        return {
            hashedKey,
            openedKey,
            salt,
        };
    }

    public async isValid(key: string, privateKey: string): Promise<boolean> {
        return await compare(key, privateKey);
    }
}
