import { Injectable } from '@nestjs/common';
import { OidcOptionsFactory, OidcModuleOptions } from '@ffdc/nestjs-oidc';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OidcConfigService implements OidcOptionsFactory {
  constructor(private configService: ConfigService) {}

  createModuleConfig(): OidcModuleOptions {
    return {
      issuer: this.configService.get('OIDC_ISSUER'),
      clientMetadata: {
        client_id: this.configService.get('OIDC_CLIENT_ID'),
        client_secret: this.configService.get('OIDC_CLIENT_SECRET'),
      },
      authParams: {
        scope: this.configService.get('OIDC_SCOPE'),
        resource: this.configService.get('OIDC_RESOURCE'),
        nonce: 'true',
      },
      origin: this.configService.get('ORIGIN'),
      defaultHttpOptions: {
        timeout: 1, //20000,
      },
    };
  }
}
