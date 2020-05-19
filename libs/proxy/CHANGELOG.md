# Changelog

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:3 -->

- [0.2.0 (2020-05-19)](#020-2020-05-19)
  - [Features](#features)
- [0.1.1 (2020-04-30)](#011-2020-04-30)
  - [Bug fixes](#bug-fixes)

<!-- /TOC -->

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
