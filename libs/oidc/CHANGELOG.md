# Changelog

**Table of Contents**

<!-- TOC -->

- [Changelog](#changelog)
  - [0.7.1 (2020-06-10)](#071-2020-06-10)
    - [Bugfixes](#bugfixes)
  - [0.7.0 (2020-06-05)](#070-2020-06-05)
    - [Features](#features)
      - [How to set a global guard BEFORE](#how-to-set-a-global-guard-before)
      - [How to set a global guard NOW](#how-to-set-a-global-guard-now)
  - [0.6.1 (2020-06-03)](#061-2020-06-03)
    - [Bugfixes](#bugfixes-1)
  - [0.6.0 (2020-05-27)](#060-2020-05-27)
    - [Features](#features-1)
    - [Doc fixes](#doc-fixes)
  - [0.5.0 (2020-05-19)](#050-2020-05-19)
    - [Features](#features-2)
    - [Bug fixes](#bug-fixes)
    - [Documentation](#documentation)
  - [0.4.0 (2020-05-06)](#040-2020-05-06)
    - [Features](#features-3)
  - [0.3.1 (2020-05-06)](#031-2020-05-06)
    - [Bug fixes](#bug-fixes-1)
  - [0.3.0 (2020-04-30)](#030-2020-04-30)
    - [Features](#features-4)
  - [0.2.1 (2020-04-30)](#021-2020-04-30)
    - [Bug fixes](#bug-fixes-2)
  - [0.2.0 (2020-04-23)](#020-2020-04-23)
    - [Features](#features-5)
      - [Before](#before)
      - [Now](#now)
  - [0.1.2 (2020-04-23)](#012-2020-04-23)
    - [Bug fixes](#bug-fixes-3)

<!-- /TOC -->

## 0.7.1 (2020-06-10)

### Bugfixes

Userinfo were never resolved and appeared as a promise.

## 0.7.0 (2020-06-05)

### Features

Previously, incoming requests weren't decorated with user information.
An interceptor put `user` object in requests and calls `userInfoCallback` once the token is validated for Bearer authentication on http request.

Using `TokenGuard` requests only reflector parameter now:

#### How to set a global guard BEFORE

`main.ts`

```typescript
const issuer = app.get(ConfigService).get('OIDC_ISSUER');
const tokenStore = await getTokenStore(issuer);
const reflector = app.get(Reflector);
app.useGlobalGuards(new TokenGuard(tokenStore, reflector));
```

#### How to set a global guard NOW

`main.ts`

```typescript
app.useGlobalGuards(app.get(TokenGuard));
```

## 0.6.1 (2020-06-03)

### Bugfixes

Previously, a wrongly configured issuer or one that didn't respond within configured timeout would result in a shady error, leaving the user clueless about what is the issue at hand.\
Error handling was improved, with a link to the documentation and will terminate the application, as it is not usable :

```
[OidcModule] Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : https://github.com/fusionfabric/finastra-nodejs-libs/blob/develop/libs/oidc/README.md
[OidcModule] Terminating application
```

## 0.6.0 (2020-05-27)

### Features

- It's possible to customize the options for all HTTP requests adding `defaultHttpOptions` in `OidcModuleOptions`.
- A `nonce` value is generated if `nonce` parameter is equals to `'true'` in `authParams`.
- `userInfoCallback` allows to customize the userInfo method and add more information in user object. To use it:

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
    userInfoCallback: async userId => {
      return {
        username: userId,
        customUserInfo: 'custom',
      };
    },
  }),
  inject: [ConfigService],
  imports: [ConfigModule],
});
```

### Doc fixes

- Replace `scopes` parameter to `scope` in documentation.

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

### Bug fixes

- Fix returned error for unauthenticated requests, return `401 Unauthorized` instead of `403 Forbidden`

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
