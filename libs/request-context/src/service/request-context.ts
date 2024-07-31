import { ContinuationLocalStorage } from './continuation-local-storage';
import { Request, Response } from 'express';

export class RequestContext {
    static cls = new ContinuationLocalStorage<RequestContext>();

    constructor(
        public readonly req: Request,
        public readonly res: Response,
    ) {}

    static get currentContext() {
        return this.cls.getContext();
    }

    static set currentContext(cxt: RequestContext) {
        this.cls.setContext(cxt);
    }
}
