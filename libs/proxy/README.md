# Proxy module

## Use it

You can import the module like so :

`app.module.ts`

```typescript
ProxyModule.forRoot(ProxyModule, {
    config: {},
    services: [
        {
        id: 'ACCOUNT_INFORMATION_US',
        url: `https://api.fusionfabric.cloud/retail-us/me/account/v1/accounts`,
      }
    ]
}),
```

### Or asynchronously

`app.module.ts`

```typescript
ProxyModule.forRootAsync(ProxyModule, {
    useClass: ProxyConfigService,
    imports: [ConfigModule.forRoot()],
}),
```

`proxy-config.service.ts`

```typescript
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { ProxyModuleOptions, ProxyModuleOptionsFactory } from '@ffdc/nestjs-proxy';

@Injectable()
export class ProxyConfigService implements ProxyModuleOptionsFactory {
  constructor(private configService: ConfigService) {}

  createModuleConfig(): ProxyModuleOptions {
    const FFDC = this.configService.get('FFDC');

    const services = [
      {
        id: 'ACCOUNT_INFORMATION_US',
        url: `${FFDC}/retail-us/me/account/v1/accounts`,
      };
    ];

    return {
      services,
    };
  }
}
```
