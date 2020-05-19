# Changelog

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:3 -->

- [0.5.0 (2020-05-19)](#050-2020-05-19)
  - [Features](#features)
  - [Documentation](#documentation)
- [0.4.0 (2020-05-06)](#040-2020-05-06)
  - [Features](#features-1)
- [0.3.1 (2020-05-06)](#031-2020-05-06)
  - [Bug fixes](#bug-fixes)
- [0.3.0 (2020-04-30)](#030-2020-04-30)
  - [Features](#features-2)
- [0.2.1 (2020-04-30)](#021-2020-04-30)
  - [Bug fixes](#bug-fixes-1)
- [0.2.0 (2020-04-23)](#020-2020-04-23)
  - [Features](#features-3)
- [0.1.2 (2020-04-23)](#012-2020-04-23)
  - [Bug fixes](#bug-fixes-2)

<!-- /TOC -->

## 0.5.0 (2020-05-19)

### Features

- Module registration was harmonized with the rest of the modules :

```ts
OidcModule.forRootAsync({
  useFactory: async (configService: ConfigService) => ({
    issuer: configService.get('OIDC_ISSUER'),
    clientMetadata: {
      client_id: configService.get('OIDC_CLIENT_ID'),
      client_secret: configService.get('OIDC_CLIENT_SECRET'),
    },
    authParams: {
      scopes: configService.get('OIDC_SCOPES'),
    },
    origin: configService.get('ORIGIN'),
  }),
  inject: [ConfigService],
  imports: [ConfigModule],
});
```

If using a class, `createOidcOptions` was changed to a more generic `createModuleConfig`.

### Documentation

- Add a global description

## 0.4.0 (2020-05-06)

### Features

- `TokenGuard` now handles graphQL requests

## 0.3.1 (2020-05-06)

### Bug fixes

- Fix default `userInfoMethod` to `token`

## 0.3.0 (2020-04-30)

### Features

- New endpoint `/user` that returns user information

## 0.2.1 (2020-04-30)

### Bug fixes

- Add user groups in `req.user.userinfo`

## 0.2.0 (2020-04-23)

### Features

- Configuration is closer to [openid-client](https://github.com/panva/node-openid-client/blob/master/docs/README.md), which we are using under the hood

#### Before

```typescript
interface OidcModuleOptions {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string;
  redirectUriLogin: string;
  redirectUriLogout: string;
  userInfoMethod?: UserInfoMethod;
  clockTolerance?: number;
  resource?: string;
}
```

#### Now

```typescript
interface OidcModuleOptions {
  issuer: string;
  clientMetadata: ClientMetadata;
  authParams: AuthorizationParameters;
  origin: string;
  usePKCE?: boolean;
  userInfoMethod?: UserInfoMethod;
}
```

With [clientMetadata](https://github.com/panva/node-openid-client/blob/master/docs/README.md#new-clientmetadata-jwks-options) and [authParams](https://github.com/panva/node-openid-client/blob/master/docs/README.md#clientauthorizationurlparameters) coming from the openid-client library.

> Redirect URI for login and logout are now derived from 'origin'

## 0.1.2 (2020-04-23)

### Bug fixes

- Add resource parameter in oidc config
- provide a default value for `setupSession` instead of requiring `SESSION_SECRET` as a env variable
