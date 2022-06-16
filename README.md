# CodeX Docs

CodeX Docs is a simple but powerful documentation engine for CodeX powered with [Editor.js](//editorjs.io).

You can use CodeX Docs for product documentation, for internal team docs, or for any other documentation.

![](https://capella.pics/e3b8a441-53dc-4da6-a7a9-76b12629983b.jpg)

## Development

### Prerequisites

- NodeJS (v16.x)
- npx (installed by default with npm)
- Yarn

### Install npm packages

```shell
yarn install --frozen-lockfile
```

### Create config file

```shell
cp .codexdocsrc.sample .codexdocsrc
cp .env.sample .env
```

### Run application (both frontend and backend)

```shell
yarn dev
```

Then you can open browser and navigate to [http://localhost:3000](http://localhost:3000).

Now you can [authenticate](https://github.com/codex-team/codex.docs/#authentication) in the application and start creating your documentation.

### Available scripts

#### Start whole application (backend and frontend in watch mode)

```shell
yarn dev
```

#### Start backend in development mode

```shell
yarn start-backend
```

#### Compile TypeScript files

```shell
yarn compile
```

#### Build frontend

To build frontend sources run the following command:

```shell
yarn build-frontend
```

To build frontend and watch for changes run the following command:

```shell
yarn build-frontend:dev
```

#### Run ESLint with `--fix` option

```shell
yarn lint
```

#### Run tests

```shell
yarn test
```

### Setup

You can configure application using configs in <code>/config</code> directory.

<code>port</code> - to set port of application

<code>database</code> - to name directory with data

<code>rcFile</code> - to set destination of rc file

<code>uploads</code> - to set destination of directory to save uploads

<code>secret</code> - to set secret

<code>faviconURL</code> - to set url to get favicon

### Authentication

To manage pages you need to authorize (available on `/auth`).

To set password, set the `PASSWORD` environment variable inside the `.env` file.

## Release process

We use [release-drafter](https://github.com/release-drafter/release-drafter) to generate release notes and GitHub release.
It will automatically generate draft release based pull requests data between current version and previous version.
To make new release you need go to [releases](https://github.com/codex-team/codex.docs/releases) page find the latest draft release and mark it as ready.
After creating new release, new git tag will be created and new version will be published.

# About CodeX

<img align="right" width="120" height="120" src="https://codex.so/public/app/img/codex-logo.svg" hspace="50">

CodeX is a team of digital specialists around the world interested in building high-quality open source products on a global market. We are [open](https://codex.so/join) for young people who want to constantly improve their skills and grow professionally with experiments in cutting-edge technologies.

| 🌐                           | Join 👋                                | Twitter                                      | Instagram                                      |
| ---------------------------- | -------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| [codex.so](https://codex.so) | [codex.so/join](https://codex.so/join) | [@codex_team](http://twitter.com/codex_team) | [@codex_team](http://instagram.com/codex_team) |
