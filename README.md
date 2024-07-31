## Installation

#### PgSQL local
First of all need to start local pgsql.

```bash
$ docker run --name postgres13 -e POSTGRES_PASSWORD=postgres -p 54320:5432 -d postgres:13
```

#### Redis local
First of all need to start local redis.

```bash
$ docker run --name redis6 -p 63790:6379 -d redis:6
```

#### MongoDb local
First of all need to start local mongodb.

```bash
$ docker run --name mongo4 -p 27170:27017 -d mongo:4
```

#### RabbitMQ local
First of all need to start local rabbitmq.  

```bash
$ docker run -d --hostname rabbit3 --name rabbit3 -p 15670:15672 -p 5670:5672 rabbitmq:3-management
```

#### Setting up schemas
Open ``gitlab-ci.sql`` and copy the block that will be defined as schemas on the next start in sql terminal.

#### Setting up SQL users, roles and permissions
Open ``multiform.sql`` and copy all uncommented SQL on the next start in sql terminal.

GUI panel: http://localhost:15672
User: guest/guest
---
Then run:
```bash
# copy env files
$ cp -a env/dev/. ./
# install dependencies
$ npm install
# build database application
$ npm run build:database
# run migrations
$ npm run migration:up:all
# seed some data
$ npm run seed:run
```

#### SMTP local
Start local smtp server
```bash
$ docker run -d --hostname mailhog --name mailhog -p 1025:1025 -p 8025:8025 mailhog/mailhog
```
GUI panel: http://localhost:8025  
In `.env.local` add `MAILER_TRANSPORT=smtp://testuser:testpwd@localhost:1025`

## Running the app
Each directory in `apps` folder contains separate application.  
To run an application use command `npm run start app_name`, e.g.

```bash
# development
$ npm run start api

# watch mode
$ npm run start:dev admin

# production mode
$ npm run start:prod aemass
```

## Running tests
To run e2e tests for a specific app use `npm run test:e2e:app_name`, e.g.
```bash
# e2e tests for api
$ npm run test:e2e:api

# e2e tests for admin and specific module
$ npm run test:e2e:admin apps/admin/test/patient

# run specific test
$ npm run test:e2e:admin apps/admin/test/patient/action/move-patient-action.e2e-spec.ts

# test coverage
$ npm run test:cov
```

## Ecosystem setup
See [SETUP.md](./SETUP.md)
