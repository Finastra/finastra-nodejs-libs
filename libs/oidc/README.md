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
    OidcModule.registerAsync({
      imports: [ConfigModule.forRoot()],
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
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

> [clientMetadata](https://github.com/panva/node-openid-client/blob/master/docs/README.md#new-clientmetadata-jwks-options) and [authParams](https://github.com/panva/node-openid-client/blob/master/docs/README.md#clientauthorizationurlparameters) are coming from the openid-client library.

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

`maint.ts`

```typescript
const issuer = app.get(ConfigService).get('OIDC_ISSUER');
const tokenStore = await getTokenStore(issuer);
const reflector = app.get(Reflector);
app.useGlobalGuards(new TokenGuard(tokenStore, reflector));
```

#### Controller or route based

Due to the limitations of the dependency injections of providers being bound to a module context.
Because of this, you will need to create a factory to provide the `tokenStore` to the authGuard.

The example below is using the configService to retrieve the issuer and pass the tokenStore as a factory :

`*.module.ts`

```typescript
import { getTokenStore, TOKEN_STORE } from '@uxd-finastra/oidc';

const TokenStoreFactory = {
  provide: TOKEN_STORE,
  useFactory: async (configService: ConfigService) => {
    const issuer = configService.get('OIDC_ISSUER');
    return await getTokenStore(issuer);
  },
  inject: [ConfigService],
};

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [TokenStoreFactory],
  ...
})
```

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
