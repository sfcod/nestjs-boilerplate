import { PostgreSqlSchemaHelper as PostgreSqlSchemaHelperCore } from '@mikro-orm/postgresql';
import { snakeCase } from 'lodash';

// @TODO: do something with this
export class PostgreSqlSchemaHelper extends PostgreSqlSchemaHelperCore {
    getListTablesSQL() {
        if (process.env.CONNECTION) {
            const schema = process.env[`DATABASE_SHEMA_${snakeCase(process.env.CONNECTION).toUpperCase()}`] || 'public';

            // return (
            //     `select table_name, table_schema as schema_name ` +
            //     `from information_schema.tables where table_schema not like 'pg_%' and table_schema != 'information_schema' and table_schema = '${schema}' ` +
            //     `and table_name != 'geometry_columns' and table_name != 'spatial_ref_sys' and table_type != 'VIEW' order by table_name`
            // );

            return (
                `select table_name, table_schema as schema_name, ` +
                `(select pg_catalog.obj_description(c.oid) from pg_catalog.pg_class c where c.oid = (select ('"' || table_schema || '"."' || table_name || '"')::regclass::oid) and c.relname = table_name) as table_comment ` +
                `from information_schema.tables ` +
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                `where ${this.getIgnoredNamespacesConditionSQL('table_schema')} ` +
                `and table_name != 'geometry_columns' and table_name != 'spatial_ref_sys' and table_type != 'VIEW' and table_schema = '${schema}' ` +
                `order by table_name`
            );
        }
        return super.getListTablesSQL();
    }
}
