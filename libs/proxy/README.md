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
        config: {}
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
        config: {}
      };
    ];

    return {
      services,
    };
  }
}
```

## Configuration

Whether synchronously or asynchronously, the module takes two parameters (both optionals).

- **services** : which is a collection of urls with a given id so that you can query them more efficiently
- **config** : which is the configuration from [http-proxy](https://github.com/http-party/node-http-proxy) which we're using under the hood. Find the offical documentation of this configuration [here](https://github.com/http-party/node-http-proxy#options).

> A service can also take an optional `config`, which is the same signature as the parent one, allowing you to override configuration for that particular service !

### Default module configuration

If you do not provide any, the default proxy configuration for this module can be found in [proxy.constants.ts](./src/proxy.constants.ts), under `defaultProxyOptions`
