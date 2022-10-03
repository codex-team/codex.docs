# Development guide

This doc describes how to bootstrap and run the project locally.

## Setup

### 1. Clone the repo
```shell
git clone https://github.com/codex-team/codex.docs
```

### 2. Install dependencies

```shell
yarn install
```

### 3. Create separate config file for local overrides

```shell
touch app-config.local.yaml
```

### 4. Run the application

```shell
yarn dev
```

## Starting docs with MongoDB

By default, the application uses a local database powered by [nedb](https://www.npmjs.com/package/nedb).
In order to use MongoDB, follow these steps:


### 1. Run MongoDB instance with docker-compose

```shell
docker-compose up mongodb
```

### 2. Setup MongoDB driver in app-config.local.yaml

```yaml
database:
  driver: mongodb
  mongodb:
    uri: mongodb://localhost:27017/docs
```

### 3. Run the application

```shell
yarn dev
```

## Convert local database to MongoDB

There is small CLI tool to convert local database to MongoDB in [bin/db-converter](./bin/db-converter/README.md).
Check it out for more details.

Run it with

```shell
node bin/db-converter --db-path=./db --mongodb-uri=mongodb://localhost:27017/docs
```
