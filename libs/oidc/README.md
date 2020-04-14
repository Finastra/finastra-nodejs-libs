# OIDC Auth module

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
        clientId: configService.get('OIDC_CLIENT_ID'),
        clientSecret: configService.get('OIDC_CLIENT_SECRET'),
        scopes: configService.get('OIDC_SCOPES'),
        redirectUriLogin: configService.get('OIDC_LOGIN_REDIRECT_URI'),
        redirectUriLogout: configService.get('OIDC_LOGOUT_REDIRECT_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

`main.ts`

```typescript
import { setupSession } from '@ffdc/nestjs-oidc';

setupSession(app);
```

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

| Option         | Description      |
| -------------- | ---------------- |
| clockTolerance | Clock tolerance  |
| userInfoMethod | 'ffdc' or 'oidc' |
