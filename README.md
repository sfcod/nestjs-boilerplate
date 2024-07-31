## Installation

### Prerequisites
 - Node 18.19.0+
 - Docker

----------------


### 1. Start docker containers required for the project: 
```bash
$ docker-compose up -d
```

If need to override ports, envs, etc, create `docker-compose.override.yml` file in project root, 
and override necessary values. For example:

```yaml
# docker-compose.override.yml

services:
    postgres:
        environment:
            POSTGRES_PASSWORD: "my_custom_password"
        ports:
            - "33333:5432"

    redis:
        ports:
            - "63790:6379"
```

----------------


### 2. Create `.env.local` files
```bash
$ cp .env .env.local
$ cp .env.test .env.test.local
```

----------------


### 3. Install dependencies
```bash
$ npm ci
```

----------------

### 4. Run migrations
```bash
$ npm run build database
$ npm run migration:up
```

----------------


### 5. Running the app
Each directory in `apps` folder contains separate application.  
To run an application use command `npm run start app_name`, e.g.

```bash
# development
$ npm run start client

# watch mode
$ npm run start:dev admin

# production mode
$ npm run start:prod admin
```

### 6. Fill db with data (for now it creates admin user only)
```bash
$ npm run seed:run
```

## Running tests
To run e2e tests for a specific app use `npm run test:e2e:app_name`, e.g.
```bash
# e2e tests for client
$ npm run test:e2e:client all

# e2e tests for admin and specific module
$ npm run test:e2e:admin user/index

# run specific test
$ npm run test:e2e:admin create-user-action.e2e-spec.ts

# test coverage
$ npm run test:cov
```
