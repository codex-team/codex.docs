# CodeX Docs

Engine for documentation website using [Editor.js](//editorjs.io)

![](https://capella.pics/e3b8a441-53dc-4da6-a7a9-76b12629983b.jpg)

## Development

### Set up the environment

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

### Install npm packages

```
$ yarn install --frozen-lockfile
```

### Available scripts
#### Compile to Javascript
```
$ yarn compile
```

#### Start the server

```
$ yarn start
```

#### Run ESLint with `--fix` option

```
$ yarn lint
```

#### Run tests

```
$ yarn test
```

### Authentication

To manage pages you need to authorize (available on `/auth`).

To generate password use `yarn generatePassword [password]` command.

## Release process

We use [release-drafter](https://github.com/release-drafter/release-drafter) to generate release notes and GitHub release.
It will automatically generate draft release based pull requests data between current version and previous version.
To make new release you need go to [releases](https://github.com/codex-team/codex.docs/releases) page find the latest draft release and mark it as ready.
After creating new release, new git tag will be created and new version will be published.


# About CodeX

<img align="right" width="120" height="120" src="https://codex.so/public/app/img/codex-logo.svg" hspace="50">

CodeX is a team of digital specialists around the world interested in building high-quality open source products on a global market. We are [open](https://codex.so/join) for young people who want to constantly improve their skills and grow professionally with experiments in cutting-edge technologies.

| 🌐 | Join  👋  | Twitter | Instagram |
| -- | -- | -- | -- |
| [codex.so](https://codex.so) | [codex.so/join](https://codex.so/join) |[@codex_team](http://twitter.com/codex_team) | [@codex_team](http://instagram.com/codex_team) |
