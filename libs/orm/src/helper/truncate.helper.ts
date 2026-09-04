import { SqlEntityManager } from '@mikro-orm/sql';

export const truncateAll = async (entityManager: SqlEntityManager, schemas = ['public']) => {
    if (process.env.NODE_ENV !== 'test') {
        throw new Error('This fn runs only in "test" env');
    }

    const tables = await entityManager.execute<{ table_schema: string; table_name: string }[]>(
        `SELECT * FROM information_schema.tables WHERE table_schema IN ('${schemas.join("','")}');`,
    );

    const sql = [];
    for (const table of tables) {
        if (table.table_name === 'mikro_orm_migrations') {
            continue;
        }
        sql.push(`TRUNCATE TABLE "${table.table_schema}"."${table.table_name}" CASCADE;`);
    }

    await entityManager.execute(sql.join(' '));
};
