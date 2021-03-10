<p align="center">
  <a href="https://www.fusionfabric.cloud/" target="blank"><img src="https://www.fusionfabric.cloud/sites/default/files/styles/banner_standard/public/image/2018-05/Fusion%20Operate%20Cloud%20%283%29.jpg"  alt="FusionFabric.cloud" /></a>
</p>
  
  <p align="center">A set of opinionated libraries for building efficient and scalable server-side applications with <a href="http://nodejs.org" target="blank">Node.js</a>.</p>
<p align="center">
  <a href="https://github.com/finastra/finastra-nodejs-libs/actions?query=workflow%3ABuild"><img src="https://github.com/finastra/finastra-nodejs-libs/workflows/Build/badge.svg" alt="Build status" /></a>
  <a href="https://codecov.io/gh/finastra/finastra-nodejs-libs">
  <img src="https://codecov.io/gh/finastra/finastra-nodejs-libs/branch/develop/graph/badge.svg" />
</a>
<a href="https://app.fossa.com/projects/git%2Bgithub.com%2FFinastra%2Ffinastra-nodejs-libs?ref=badge_shield" alt="FOSSA Status"><img src="https://app.fossa.com/api/projects/git%2Bgithub.com%2FFinastra%2Ffinastra-nodejs-libs.svg?type=shield"/></a>
  <a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <img src="https://img.shields.io/badge/PRs-welcome-green" alt="PRs welcome"/>
  <a href="https://twitter.com/FinastraFS"><img src="https://img.shields.io/twitter/follow/FinastraFS.svg?style=social&label=Follow"></a>
</p>


[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FFinastra%2Ffinastra-nodejs-libs.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FFinastra%2Ffinastra-nodejs-libs?ref=badge_large)

## Packages

<br/>

<h3> 
NestJS
<img src="https://nestjs.com/img/logo-small.svg" height="20" alt="Nest Logo" />
</h3>

| Project       | Package                                                                        | Version                                                                                                                         | Links                                                                                                                                                                             |
| ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **OIDC Auth** | [`@finastra/nestjs-oidc`](https://npmjs.com/package/@finastra/nestjs-oidc)     | [![latest](https://img.shields.io/npm/v/@finastra/nestjs-oidc/latest.svg)](https://npmjs.com/package/@finastra/nestjs-oidc)     | [![README](https://img.shields.io/badge/README--green.svg)](/libs/oidc/README.md) [![changelog](https://img.shields.io/badge/changelog-%20-yellow)](./libs/oidc/CHANGELOG.md)     |
| **Proxy**     | [`@finastra/nestjs-proxy`](https://npmjs.com/package/@finastra/nestjs-proxy)   | [![latest](https://img.shields.io/npm/v/@finastra/nestjs-proxy/latest.svg)](https://npmjs.com/package/@finastra/nestjs-proxy)   | [![README](https://img.shields.io/badge/README--green.svg)](/libs/proxy/README.md) [![changelog](https://img.shields.io/badge/changelog-%20-yellow)](./libs/proxy/CHANGELOG.md)   |
| **Logger**    | [`@finastra/nestjs-logger`](https://npmjs.com/package/@finastra/nestjs-logger) | [![latest](https://img.shields.io/npm/v/@finastra/nestjs-logger/latest.svg)](https://npmjs.com/package/@finastra/nestjs-logger) | [![README](https://img.shields.io/badge/README--green.svg)](/libs/logger/README.md) [![changelog](https://img.shields.io/badge/changelog-%20-yellow)](./libs/logger/CHANGELOG.md) |

<br/>

### Vanilla

| Project       | Package                                                                | Version                                                                                                                 | Links                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SSR Pages** | [`@finastra/ssr-pages`](https://npmjs.com/package/@finastra/ssr-pages) | [![latest](https://img.shields.io/npm/v/@finastra/ssr-pages/latest.svg)](https://npmjs.com/package/@finastra/ssr-pages) | [![README](https://img.shields.io/badge/README--green.svg)](/libs/ssr-pages/README.md) [![changelog](https://img.shields.io/badge/changelog-%20-yellow)](./libs/ssr-pages/CHANGELOG.md) |

<br/>

<h3> 
<img src="https://developer.fusionfabric.cloud/assets/img/ffdc-logo.png" height="20" alt="FFDC Logo" />
  APIs
</h3>

| Project                                       | Package                                                                                          | Version                                                                                                                                           | Links                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Real-time Account Balances and Statements** |                                                                                                  |                                                                                                                                                   | [![devPortal](https://img.shields.io/badge/DevPortal-%20-blue)](https://developer.fusionfabric.cloud/solution/real-time-account-balances-and-statement)                                                                                                                                                                                                                                                        |
| ↳ **Accounts and Balances API**               | [`@finastra/api_corporate-accounts`](https://npmjs.com/package/@finastra/api_corporate-accounts) | [![latest](https://img.shields.io/npm/v/@finastra/api_corporate-accounts/latest.svg)](https://npmjs.com/package/@finastra/api_corporate-accounts) | [![README](https://img.shields.io/badge/README--green.svg)](/libs/ffdc-apis/corporate-accounts/README.md) [![changelog](https://img.shields.io/badge/changelog-%20-yellow)](./libs/ffdc-apis/corporate-accounts/CHANGELOG.md) [![devPortal](https://img.shields.io/badge/DevPortal-%20-blue)](https://developer.fusionfabric.cloud/api/corporate-accounteinfo-me-v1-831cb09d-cc10-4772-8ed5-8a6b72ec8e01/docs) |

<br/>

## Installation

```bash
$ npm install
```

## Running the sample app

```bash
# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

## License

All libraries in this repo are [MIT licensed](LICENSE).