import { PostgreSqlPlatform as PostgreSqlPlatformBase } from '@mikro-orm/postgresql';
import { PostgreSqlSchemaHelper } from './postgresql-schema-helper';

export class PostgresqlPlatform extends PostgreSqlPlatformBase {
    protected readonly schemaHelper = new PostgreSqlSchemaHelper(this);
}
