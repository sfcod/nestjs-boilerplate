import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { RolePermission } from '../service/role-permission';

@Injectable()
export class RolePermissionMiddleware implements NestMiddleware<Request, Response> {
    constructor(private readonly rolePermission: RolePermission) {}

    use(req: Request, res: Response, next: () => void) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        req.rolePermission = this.rolePermission;

        next();
    }
}
