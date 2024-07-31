import { compare, hash } from 'bcrypt';

export const hashCompare = (email: string, hash: string) => {
    const decoded = Buffer.from(hash, 'base64').toString('ascii');
    return compare(process.env.UNSUBSCRIBE_SECRET + email, decoded);
};

export const createHash = async (email: string) => {
    return Buffer.from(await hash(process.env.UNSUBSCRIBE_SECRET + email, 5)).toString('base64');
};
