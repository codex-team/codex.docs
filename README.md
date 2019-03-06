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
