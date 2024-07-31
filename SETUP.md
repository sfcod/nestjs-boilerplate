## What is it?
This file describes how to start all services from PHY ecosystem locally.

You need 3 projects started locally: 
- `phyapi` - this project, the heart of the system.
- `phyadmin` - frontend (react.js) client for `admin` application of `phyapi`.

## Step by step

### 1. Setup locally phyapi, phyadmin
See Installation step in  [README.md](./README.md) for `phyapi`  
See `README.md` files in `phyadmin` projects


### 2. Start all necessary phyapi applications
Run in different terminals next commands:
```bash
$ npm run start:dev api
$ npm run start:dev admin
$ npm run start:dev aemass
```

### 3. Exercises initialization
In project `phyapi` run:
```bash
$ npm run cli-database exercise import
```

### 4. Check if everything works
Go to admin panel [localhost:3000](http://localhost:3000) (`phyadmin`) and login as admin@phy.com / 123123
