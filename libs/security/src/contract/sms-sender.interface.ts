export interface SmsSenderInterface {
    send(params: { to: string; body: string }): Promise<void>;
}
