import { RequestContext } from '@mikro-orm/core';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { OrmResolver } from '../service/orm-resolver';

@Injectable()
export class MikroOrmMiddleware implements NestMiddleware {
    constructor(private readonly moduleRef: ModuleRef) {}

    use(req: unknown, res: unknown, next: (...args: any[]) => void) {
        const ormResolver: OrmResolver = this.moduleRef.get(OrmResolver);

        const orms = [];
        for (const connection of ormResolver.getConnections()) {
            orms.push(connection.em);
        }

        RequestContext.create(orms, next);
    }
}
