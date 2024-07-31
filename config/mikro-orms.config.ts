import {
    MIKRO_ORM_DEFAULT,
    AccessKey,
    AccessKeyPermission,
    Admin,
    Device,
    Notification,
    User,
    UserAttribute,
    UserSocial,
    WebauthnDevice,
} from '@libs/orm';
import { FlushMode, LoadStrategy } from '@mikro-orm/core';
import { NotFoundException } from '@nestjs/common';
import { MikroOrmModuleSyncOptions } from '@mikro-orm/nestjs/typings';
import { PostgreSqlDriver } from '@libs/orm-core';

const isProd = process.env.NODE_ENV === 'production';

const defaultOrm = [
    Notification,
    AccessKey,
    AccessKeyPermission,
    Admin,
    User,
    Device,
    UserSocial,
    UserAttribute,
    WebauthnDevice,
];

export default [
    {
        contextName: MIKRO_ORM_DEFAULT,
        clientUrl: process.env.DATABASE_URL_DEFAULT,
        driver: PostgreSqlDriver,
        entities: defaultOrm,
        loadStrategy: LoadStrategy.JOINED,
        findOneOrFailHandler: () => {
            throw new NotFoundException();
        },
        // implicitTransactions: false,
        migrations: {
            path: __dirname + '/../apps/database/src/migration/default',
            tableName: isProd ? 'mikro_orm_migrations' : 'public.mikro_orm_migrations',
            transactional: true,
            allOrNothing: false,
            emit: isProd ? 'js' : 'ts',
            // pattern: isProd ? /^[\w-]+\d+\.js$/ : /^[\w-]+\d+\.ts$/,
            disableForeignKeys: false,
            snapshot: false,
        },
        flushMode: FlushMode.COMMIT,
        // hydrator: PostgreSqlHydrator,
        forceUtcTimezone: true,
        debug: process.env.NODE_ENV === 'debug' ? ['query'] : false,
    },
] as MikroOrmModuleSyncOptions[];
