# Changelog

**Table of Contents**

<!-- TOC depthfrom:2 depthto:3 -->

- [2022-07-20](#2022-07-20)
  - [Features](#features)
- [2021-09-27](#2021-09-27)
  - [Features](#features)
- [2021-08-18](#2021-08-18)
  - [Bug fixes](#bug-fixes)
- [2021-04-05](#2021-04-05)
  - [Bug fixes](#bug-fixes)
- [2021-03-25](#2021-03-25)
  - [Bug fixes](#bug-fixes)
- [2021-02-09](#2021-02-09)
  - [Features](#features)
- [2021-01-28](#2021-01-28)
  - [Bug fixes](#bug-fixes)
- [2021-01-11](#2021-01-11)
  - [Bug fixes](#bug-fixes)

<!-- /TOC -->

## 0.4.0 (2022-07-20)

### Features

Compatible with Nest v9

## 0.3.0 (2021-09-27)

### Features

- Nest 8 compatible

## 0.2.3 (2021-08-18)

### Bug fixes

- Fix error display

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
