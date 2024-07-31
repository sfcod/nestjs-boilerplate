export class WebauthnException extends Error {
    constructor(
        message: string,
        public readonly cause?: Error,
    ) {
        super(message);
        this.name = 'WebauthnException';
        this.cause = cause;
    }
}
