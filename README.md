# CodeX Docs

[CodeX Docs](https://docs.codex.so/) is a free docs application. It's based on Editor.js ecosystem which gives all modern opportunities for working with content.

You can use it for product documentation, for internal team docs, for personal notes or any other need.

![page-overview-bright](https://user-images.githubusercontent.com/3684889/190149130-6a6fcdec-09bc-4f96-8bdc-5ff4d789f248.png)

It's super easy to install and use.

## Features

- 🤩 [Editor.js](https://editorjs.io/) ecosystem powered
- 📂 Docs nesting — create any structure you need
- 💎 Static rendering
- 📱 Nice look on Desktop and Mobile
- 🌙 Dark mode — system preference detection, manual toggle, localStorage persistence
- 🔥 Beautiful page URLs. Human-readable and SEO-friendly.
- 🦅 [Hawk](https://hawk.so/?from=docs-demo) is hunting. Errors tracking integrated
- 💌 [Misprints](https://github.com/codex-team/codex.misprints) reports to the Telegram / Slack
- 📈 [Yandex Metrica](https://metrica.yandex.com/about) integrated
- 🚢 Deploy easily — no DB and other deps required
- 🤙 Simple configuration
- ⚙️ Tune UI as you need. Collapse sections, hide the Sidebar

## Demo

Here is our [Demo Application](https://docs-demo.codex.so/) where you can try CodeX Docs in action.

## Guides

1. [Getting Started](https://docs.codex.so/getting-started)
2. [Configuration](https://docs.codex.so/configuration)
3. [Kubernetes deployment](https://docs.codex.so/k8s-deployment)
4. [Authentication](https://docs.codex.so/authentication)
5. [Writing](https://docs.codex.so/writing)
6. [How to enable analytics](https://docs.codex.so/yandex-metrica)
7. [Contribution guide](https://docs.codex.so/contribution)

## Getting Started

### 1. Clone the repo.

```shell
git clone https://github.com/codex-team/codex.docs
```

### 2. Fill the config

Read about available [configuration](https://docs.codex.so/configuration) options.

### 3. Run the application

#### Using Yarn

```shell
yarn && yarn start
```

#### Using Docker

```
docker-compose build
docker-compose up
```

#### Using Kubernetes

We have the ready-to-use [Helm chart](https://github.com/codex-team/codex.docs.chart) to deploy project in Kubernetes

## Dark Mode Feature

The dark mode feature is available in the `feature/dark-mode` branch. It includes:
- System preference detection
- Manual toggle button in the header
- localStorage persistence
- WCAG 2.1 AA accessibility compliance

### Prerequisites for Dark Mode

- **Node.js 20 or higher is required** (eslint-plugin-jsdoc@62.9.0+ only supports Node 20+)
- Update your Node.js if you're running an older version: `node --version`

### Get Dark Mode Working

#### Development with Yarn

```shell
# Checkout the dark mode branch
git checkout feature/dark-mode

# Install dependencies (--ignore-engines bypasses Node version warnings)
yarn install --ignore-engines

# Start the dev server
yarn dev
```

Access the app at http://localhost:3000 and click the sun/moon toggle in the header.

#### Production with Docker

```shell
# Checkout the dark mode branch
git checkout feature/dark-mode

# Create local config
cp docs-config.yaml docs-config.local.yaml

# Build and start
docker compose up -d --build
```

Access the app at http://localhost:3000 with the toggle button visible in the header.

## Development

See documentation for developers in [DEVELOPMENT.md](./DEVELOPMENT.md).

# About CodeX

<img align="right" width="120" height="120" src="https://codex.so/public/app/img/codex-logo.svg" hspace="50">

CodeX is a team of digital specialists around the world interested in building high-quality open source products on a global market. We are [open](https://codex.so/join) for young people who want to constantly improve their skills and grow professionally with experiments in cutting-edge technologies.

| 🌐                           | Join 👋                                | Twitter                                      | Instagram                                      |
| ---------------------------- | -------------------------------------- | -------------------------------------------- | ---------------------------------------------- |
| [codex.so](https://codex.so) | [codex.so/join](https://codex.so/join) | [@codex_team](http://twitter.com/codex_team) | [@codex_team](http://instagram.com/codex_team) |
