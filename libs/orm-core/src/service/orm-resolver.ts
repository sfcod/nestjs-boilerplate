import { Injectable } from '@nestjs/common';
import { EntityManager, MikroORM } from '@mikro-orm/core';
import { EntityName } from '@mikro-orm/core/typings';

const CONNECTION_NAME_METADATA = '_connection__name_metadata';

@Injectable()
export class OrmResolver {
    constructor(private readonly connections: MikroORM[]) {
        for (const connection of connections) {
            for (const entity of connection.config.get('entities')) {
                Reflect.defineMetadata(CONNECTION_NAME_METADATA, connection.config.get('contextName'), entity);
            }
        }
    }

    public orm(entity: EntityName<any>): MikroORM {
        const connectionName = this.getConnectionName(entity);

        if (!connectionName) {
            throw new Error(
                `OrmResolver error: cant resolve connection for entity: '${
                    entity instanceof String ? entity : entity.constructor.name
                }'`,
            );
        }
        return this.ormByConnectionName(connectionName);
    }

    public ormByConnectionName(name: string): MikroORM {
        const connection = this.connections.find((connection) => connection.config.get('contextName') === name);

        if (!connection) {
            throw new Error(`OrmResolver error: unknown connection: '${name}'`);
        }

        return connection;
    }

    public em(entity: EntityName<any>): EntityManager | any {
        return this.orm(entity).em as any;
    }

    public emByConnectionName(name: string): EntityManager | any {
        return this.ormByConnectionName(name).em as any;
    }

    public getConnectionName(entity: EntityName<any>): string {
        if (typeof entity === 'string') {
            for (const connection of this.connections) {
                for (const e of connection.config.get('entities') as any) {
                    if (e.name === entity) {
                        return this.getConnectionName(e);
                    }
                }
            }

            throw new Error(`OrmResolver error: unknown entity: 'entity'`);
        }

        return (
            Reflect.getMetadata(CONNECTION_NAME_METADATA, entity.constructor) ||
            Reflect.getMetadata(CONNECTION_NAME_METADATA, entity)
        );
    }

    public getConnections(): MikroORM[] {
        return this.connections;
    }
}
