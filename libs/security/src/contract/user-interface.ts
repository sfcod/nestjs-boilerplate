export interface UserInterface {
    getRoles(): string[];

    getPassword(): string;

    getSalt(): string | null;

    getUuid(): string;

    getUsername(): string;

    getPlainPassword(): string;

    setPlainPassword(password: string): void;
}
