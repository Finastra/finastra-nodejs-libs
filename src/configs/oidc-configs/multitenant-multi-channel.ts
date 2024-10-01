import { OidcModuleOptions, OidcOptionsFactory, UserInfoMethod } from '@finastra/nestjs-oidc';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OidcMultitenantMultiChannelConfig implements OidcOptionsFactory {
  readonly logger = new Logger(OidcMultitenantMultiChannelConfig.name);

  constructor(private configService: ConfigService) { }

  createModuleConfig(): OidcModuleOptions {
    const config = {
      issuerOrigin: this.configService.get('OIDC_ISSUER_ORIGIN'),
      b2c: {
        clientMetadata: {
          client_id: this.configService.get('OIDC_CLIENT_ID_B2C'),
          client_secret: this.configService.get('OIDC_CLIENT_SECRET_B2C'),
        },
      },
      b2e: {
        clientMetadata: {
          client_id: this.configService.get('OIDC_CLIENT_ID_B2E'),
          client_secret: this.configService.get('OIDC_CLIENT_SECRET_B2E'),
        },
      },
      authParams: {
        scope: this.configService.get('OIDC_SCOPE'),
        resource: this.configService.get('OIDC_RESOURCE'),
        redirect_uri: this.configService.get('OIDC_REDIRECT_URI'),
        nonce: 'true',
      },
      origin: this.configService.get('OIDC_ORIGIN'),
      userInfoMethod: UserInfoMethod.token,
      defaultHttpOptions: {
        timeout: 20000,
      },
    };

    this.logger.log(config);
    return config;
  }
}
