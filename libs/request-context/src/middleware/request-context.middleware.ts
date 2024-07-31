import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestContext } from '../service/request-context';
import { v4 } from 'uuid';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware<Request, Response> {
    use(req: Request, res: Response, next: () => void) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.uniqueId = v4();
        RequestContext.currentContext = new RequestContext(req, res);
        next();
    }
}
