import { AsyncLocalStorage } from 'async_hooks';

export class ContinuationLocalStorage<T> extends AsyncLocalStorage<T> {
    public getContext(): T | undefined {
        return this.getStore();
    }
    public setContext(value: T): T {
        this.enterWith(value);
        return value;
    }
}
