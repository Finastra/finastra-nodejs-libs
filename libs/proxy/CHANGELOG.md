# Changelog

**Table of Contents**

<!-- TOC depthfrom:2 depthto:3 -->

- [2022-05-18](#2022-05-18)
  - [Features](#features)
- [2021-11-4](#2021-11-4)
  - [Features](#features)
- [2021-10-20](#2021-10-20)
  - [Bugfixes](#bugfixes)
- [2021-10-20](#2021-10-20)
  - [Bugfixes](#bugfixes)
- [2021-10-19](#2021-10-19)
  - [Bugfixes](#bugfixes)
- [2021-09-27](#2021-09-27)
  - [Features](#features)
- [2020-09-16](#2020-09-16)
  - [Features](#features)
- [2020-07-23](#2020-07-23)
  - [Bugfixes](#bugfixes)
- [2020-07-23](#2020-07-23)
  - [Features](#features)
- [2020-06-25](#2020-06-25)
  - [Bug fixes](#bug-fixes)
- [2020-05-19](#2020-05-19)
  - [Features](#features)
- [2020-04-30](#2020-04-30)
  - [Bug fixes](#bug-fixes)

<!-- /TOC -->

## 0.7.0 (2022-05-18)

### Features

- Adds an option to opt out from token forwarding (per service).

```typescript
services: [
  {
    id: 'THIRD_PARTY_SERVICE',
    url: 'https://some-service.com/some-endpoint',
    forwardToken: false,
  },
];
```

- Cookies are not proxied anymore by default. You can opt in by listing the cookie names in the `allowedCookies` option.

```typescript
allowedCookies: ['cookie1', 'cookie2'],
```

## 0.6.0 (2021-11-4)

### Features

- Remove possibility to proxy a call without a `serviceId`

## 0.5.3 (2021-10-20)

### Bugfixes

- Fix calls with queryParams

## 0.5.2 (2021-10-20)

### Bugfixes

- Use `url-join` to parse and join urls and solve use cases when baseUrl has a subpath

## 0.5.1 (2021-10-19)

### Bugfixes

- Use out of the box `URL` to parse and join urls

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
