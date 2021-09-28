# Changelog

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:3 -->

- [0.5.0 (2021-09-27)](#050-2021-09-27)
  - [Features](#features)
- [0.4.0 (2020-09-16)](#040-2020-09-16)
  - [Features](#features-1)
- [0.3.1 (2020-07-23)](#031-2020-07-23)
  - [Bugfixes](#bugfixes)
- [0.3.0 (2020-07-23)](#030-2020-07-23)
  - [Features](#features-2)
- [0.2.1 (2020-06-25)](#021-2020-06-25)
  - [Bug fixes](#bug-fixes)
- [0.2.0 (2020-05-19)](#020-2020-05-19)
  - [Features](#features-3)
- [0.1.1 (2020-04-30)](#011-2020-04-30)
  - [Bug fixes](#bug-fixes-1)

<!-- /TOC -->

## 0.5.0 (2021-09-27)

### Features

- Nest 8 compatible

## 0.4.0 (2020-09-16)

### Features

It is possible to use proxy module with oidc module with a multitenancy configuration.

## 0.3.1 (2020-07-23)

### Bugfixes

Fix typo for `accessToken` which prevented to retrieve and pass token

## 0.3.0 (2020-07-23)

### Features

Compatible with `@ffdc/nestjs-oidc` 0.10.0 onwards

## 0.2.1 (2020-06-25)

### Bug fixes

- Log when error instead of throwing error, which would kill the process

## 0.2.0 (2020-05-19)

### Features

- Module registration was harmonized and no longer uses `@golevelup/nestjs-modules`

```ts
ProxyModule.forRoot({}),
```

Or asynchronously :

```ts
ProxyModule.forRootAsync({
  useClass: ProxyConfigService,
  imports: [ConfigModule],
}),
```

## 0.1.1 (2020-04-30)

### Bug fixes

- Return a `404` instead of a `500` when no serviceId has been found
