import { PostgreSqlDriver as PostgreSqlDriverBase } from '@mikro-orm/postgresql';
import { PostgresqlPlatform } from './postgresql-platform';

export class PostgreSqlDriver extends PostgreSqlDriverBase {
    protected readonly platform: PostgresqlPlatform = new PostgresqlPlatform();
}
