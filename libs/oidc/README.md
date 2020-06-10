# OIDC Auth module

NestJS module to enable OAuth 2 & OIDC login to your application.\
It exposes 4 endpoints :

- login
- login/callback
- logout
- user

And also a `TokenGuard`

## Use it

`app.module.ts`

```typescript
import { OidcModule } from '@ffdc/nestjs-oidc';

@Module({
  imports: [
    OidcModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        issuer: configService.get('OIDC_ISSUER'),
        clientMetadata: {
          client_id: configService.get('OIDC_CLIENT_ID'),
          client_secret: configService.get('OIDC_CLIENT_SECRET'),
        },
        authParams: {
          scope: configService.get('OIDC_SCOPE'),
        },
        origin: configService.get('ORIGIN'),
        // Optional properties
        defaultHttpOptions: {
          timeout: 20000,
        },
        userInfoCallback: async userId => {
          return {
            username: userId,
            customUserInfo: 'custom',
          };
        },
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

> [clientMetadata](https://github.com/panva/node-openid-client/blob/master/docs/README.md#new-clientmetadata-jwks-options) and [authParams](https://github.com/panva/node-openid-client/blob/master/docs/README.md#clientauthorizationurlparameters) are coming from the openid-client library.
> [defaultHttpOptions](https://github.com/panva/node-openid-client/blob/master/docs/README.md#customizing-http-requests) can be used to customize all options that openid-client sets for all requests.
> `userInfoCallback` can be used to customize user information returned in user object on authentication.

`main.ts`

```typescript
import { setupSession } from '@ffdc/nestjs-oidc';

setupSession(app);
```

> By default, session secret will be looked for in the `SESSION_SECRET` environment variable. If not provided, a uuid will be generated instead

### Auth Guards

Only one guard is exposed. \
You can either use it globally, or scoped per controller or route.

#### Globally

`main.ts`

```typescript
app.useGlobalGuards(app.get(TokenGuard));
```

#### Controller or route based

`*.controller.ts`

```typescript
import { TokenGuard } from '@ffdc/nestjs-oidc';

@UseGuards(TokenGuard)
@Controller('')
```

## Other options to register OidcModule

| Option            | Description                                                             |
| ----------------- | ----------------------------------------------------------------------- |
| redirectUriLogout | Where to redirect user after logout. If not specified, `origin` is used |
| usePKCE           | Boolean to user or not [PKCE](https://oauth.net/2/pkce/)                |
| userInfoMethod    | `token` or `endpoint`. Default being `token`                            |
