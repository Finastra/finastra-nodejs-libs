# Changelog

<!-- TOC -->

- [Changelog](#changelog)
  - [0.2.1 (2020-06-19)](#021-2020-06-19)
    - [Bugfixes](#bugfixes)
  - [0.2.0 (2020-06-10)](#020-2020-06-10)
    - [Features](#features)
  - [0.1.1 (2020-05-19)](#011-2020-05-19)
    - [Bug fixes](#bug-fixes)

<!-- /TOC -->

## 0.2.1 (2020-06-19)

### Bugfixes

Remove unused parameter `details` from `accountsBalance` query

## 0.2.0 (2020-06-10)

### Features

FFDC APIs root path is now configurable :

```
CorporateAccountsModule.forRoot({
  ffdcApi: 'https://api.fusionfabric.cloud'
})
```

## 0.1.1 (2020-05-19)

### Bug fixes

- Fix interfaces not being exported correctly
