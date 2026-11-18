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

## Prerequisites

- **Node.js ≥ 18** (tested up to Node 24)

> **Note on NeDB:** The local database driver was migrated from the original [`nedb`](https://www.npmjs.com/package/nedb) package (unmaintained since 2016) to [`@seald-io/nedb`](https://github.com/seald/nedb). The original `nedb` crashes on Node.js ≥ 24 because it relies on removed `util.isDate()` / `util.isRegExp()` functions. The `@seald-io/nedb` fork is a drop-in replacement that supports modern Node.js versions. No data migration is needed — the on-disk format is identical.

## Starting docs with MongoDB

By default, the application uses a local database powered by [@seald-io/nedb](https://github.com/seald/nedb) (a maintained fork of nedb).
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

## Dark Mode

The application includes a dark mode that can be toggled via the sun/moon button in the header. Theme preference is saved to `localStorage` and persists across sessions. If no preference is saved, the system `prefers-color-scheme` setting is used.

The theme system uses CSS custom properties defined in `src/frontend/styles/vars.pcss` (light defaults) and `src/frontend/styles/dark-mode.pcss` (dark overrides via `[data-theme="dark"]`). The `ThemeManager` module (`src/frontend/js/modules/themeManager.js`) handles initialization, persistence, and theme switching.

All dark mode colors follow WCAG 2.1 AA contrast requirements.

## Testing

### Unit Tests

```shell
yarn test
```

### E2E Tests (Playwright)

Runs across Chromium, Firefox, and WebKit:

```shell
yarn test:e2e
```

Interactive UI mode:

```shell
yarn test:e2e:ui
```

The E2E suite auto-starts the dev server on port 7777. Test files are in `src/test/e2e/`.

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
