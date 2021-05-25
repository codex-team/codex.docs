## Docker installation

Create `docker-compose.yml` configuration with the following content
```
version: "3.2"
services:
  docs:
    image: codexteamuser/codex-docs:prod
    ports:
      - 127.0.0.1:8001:8000
    volumes:
      - ./.codexdocsrc:/usr/src/app/.codexdocsrc:ro
      - ./config/production.json:/usr/src/app/config/production.json:ro
      - ./public/uploads:/usr/src/app/public/uploads
      - .db:/usr/src/app/.db
```

Create empty folders `.db`, `public` and `config`.

Create the production config `./config/production.json`  with the following content:
```
{
  "port": 8000,
  "database": ".db",
  "uploads": "public/uploads",
  "secret": "[password]"
}
```

Port `8000` should equal to the internal port in `docker-compose.yml`. Fill `secret` with some random password.

Create the config `codexdocsrc`  with the following content:
```
{
  "title": "Docs",
  "description": "The documents",
  "menu": [
    {"title": "Main", "uri": "/main"}
  ],
  "landingFrameSrc": "",
  "startPage": "main",
  "misprintsChatId": "",
  "yandexMetrikaId": ""
}
```

Now you can run the Docs with `docker-compose up -d`.

Do not forget to initialize password with `docker-compose exec docs yarn generatePassword [password]`

## Set up the environment

Install node version manager and required version of node js
```
$ chmod u+x ./bin/nvm.sh && ./bin/nvm.sh
$ nvm install
```

> For windows use [nvm for windows](https://github.com/coreybutler/nvm-windows)

Install Yarn package manager
```
$ brew install yarn --without-node
```

> Use `--without-node` flag  because nvm version of Node is used

Or download it directly from the [website](https://yarnpkg.com/en/docs/install)

## Install npm packages

```
$ yarn install --frozen-lockfile
```

## Available scripts

### Start the server

```
$ yarn start
```

### Run ESLint with `--fix` option

```
$ yarn lint
```

### Run tests

```
$ yarn test
```

### Authentication

To manage pages you need to authorize (available on `/auth`).

To generate password use `yarn generatePassword [password]` command.
