# Changelog

<!-- TOC -->

- [Changelog](#changelog)
  - [2.0.1 (2020-06-19)](#201-2020-06-19)
    - [Bugfixes](#bugfixes)
  - [2.0.0 (2020-06-10)](#200-2020-06-10)
    - [Features](#features)
  - [0.1.1 (2020-05-19)](#011-2020-05-19)
    - [Bug fixes](#bug-fixes)

<!-- /TOC -->

## 2.0.1 (2020-06-19)

### Bugfixes

Remove unused parameter `details` from `accountsBalance` query

## 2.0.0 (2020-06-10)

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
