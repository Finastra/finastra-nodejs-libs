# Changelog

**Table of Contents**

<!-- TOC depthFrom:2 depthTo:3 -->

- [Changelog](#changelog)
  - [0.2.1 (2020-04-30)](#021-2020-04-30)
    - [Bug fixes](#bug-fixes)
  - [0.2.0 (2020-04-23)](#020-2020-04-23)
    - [Features](#features)
      - [Before](#before)
      - [Now](#now)
  - [0.1.2 (2020-04-23)](#012-2020-04-23)
    - [Bug fixes](#bug-fixes-1)

<!-- /TOC -->

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
