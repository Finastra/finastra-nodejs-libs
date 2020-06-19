import { Injectable } from '@nestjs/common';
import {
  OidcOptionsFactory,
  OidcModuleOptions,
  UserInfoMethod,
} from '@ffdc/nestjs-oidc';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OidcConfigService implements OidcOptionsFactory {
  constructor(private configService: ConfigService) {}

  createModuleConfig(): OidcModuleOptions {
    return {
      identityProviders: [
        {
          id: 'ffdc',
          path: 'ffdc',
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
        },
        {
          id: 'okta',
          path: 'okta',
          issuer: this.configService.get('OKTA_ISSUER'),
          clientMetadata: {
            client_id: this.configService.get('OKTA_CLIENT_ID'),
            client_secret: this.configService.get('OKTA_CLIENT_SECRET'),
          },
          userInfoMethod: UserInfoMethod.endpoint,
          authParams: {
            scope: this.configService.get('OIDC_SCOPE'),
            nonce: 'true',
          },
        },
      ],
      /* issuer: this.configService.get('OIDC_ISSUER'),
      clientMetadata: {
        client_id: this.configService.get('OIDC_CLIENT_ID'),
        client_secret: this.configService.get('OIDC_CLIENT_SECRET'),
      },
      authParams: {
        scope: this.configService.get('OIDC_SCOPE'),
        resource: this.configService.get('OIDC_RESOURCE'),
        nonce: 'true',
      }, */
      origin: this.configService.get('ORIGIN'),
      defaultHttpOptions: {
        timeout: 20000,
      },
    };
  }
}
