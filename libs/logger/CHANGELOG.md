# Changelog

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:3 -->
- [0.2.2 (2021-04-05)](#022-2021-04-05)
    - [Bug fixes](#bug-fixes)

- [0.2.1 (2021-03-25)](#021-2021-03-25)
    - [Bug fixes](#bug-fixes-1)
- [0.2.0 (2021-02-09)](#020-2021-02-09)
    - [Features](#features)
- [0.1.2 (2021-01-28)](#012-2021-01-28)
    - [Bug fixes](#bug-fixes-2)
- [0.1.1 (2021-01-11)](#011-2021-01-11)
    - [Bug fixes](#bug-fixes-3)

<!-- /TOC -->
## 0.2.2 (2021-04-05)
### Bug fixes
- Scope of `OMSLogger` is transient now.


## 0.2.1 (2021-03-25)

### Bug fixes

- Fix graphql dependency related issues

## 0.2.0 (2021-02-09)

### Features

- New `GraphQLLoggingInterceptor` interceptor
- `LoggingInterceptor` renamed to `HttpLoggingInterceptor`
- @nestjs/graphql is now optionnal, only mandatory if you're using `GraphQLLoggingInterceptor`
- logger is no longer mandatory in constructor

## 0.1.2 (2021-01-28)

### Bug fixes

- Fix memory leak

## 0.1.1 (2021-01-11)

### Bug fixes

- Fix for Http interceptor when used in a GraphQL context
