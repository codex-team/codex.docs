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
touch docs-config.local.yaml
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
docker-compose -f docker-compose.dev.yml up mongodb
```

### 2. Setup MongoDB driver in docs-config.local.yaml

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

## Using S3 uploads driver

Uploads driver is used to store files uploaded by users.
By default, the application uses local filesystem to store files, but S3 driver is also available.

### 1. Get credentials for S3 bucket
Create a S3 bucket and get access key and secret key (or use existing ones)

### 2. Setup S3 driver in docs-config.local.yaml

```yaml
uploads:
  driver: "s3"
  s3:
    bucket: example.codex.so
    region: "eu-central-1"
    baseUrl: "http://example.codex.so.s3-website.eu-central-1.amazonaws.com"
    keyPrefix: "docs-test"
    accessKeyId: "<secret>"
    secretAccessKey: "<secret>
```

### 3. Run the application

```shell
yarn dev
```
