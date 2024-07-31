import { EntityManager } from '@mikro-orm/knex';

export const truncateAll = async (entityManager: EntityManager, schemas = ['public']) => {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('This fn runs only in "test" env');
    }

    const knex = entityManager.getKnex();

    const tables = await knex.raw(
        `SELECT * FROM information_schema.tables WHERE table_schema IN ('${schemas.join("','")}');`,
    );

    const sql = [];
    for await (const table of tables.rows) {
        if (table.table_name === 'mikro_orm_migrations') {
            continue;
        }
        sql.push(`TRUNCATE TABLE "${table.table_schema}"."${table.table_name}" CASCADE;`);
    }

    await knex.raw(sql.join(' '));
    await knex.raw(`SELECT Concat('TRUNCATE TABLE ',table_catalog,'.', table_schema,'.',TABLE_NAME, ';')
              FROM INFORMATION_SCHEMA.TABLES where table_schema in ('${schemas.join("','")}');
              `);
};
