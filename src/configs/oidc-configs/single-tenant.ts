import { OidcModuleOptions, OidcOptionsFactory, UserInfoMethod } from '@finastra/nestjs-oidc';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OidcSingleTenantConfig implements OidcOptionsFactory {
  readonly logger = new Logger(OidcSingleTenantConfig.name);

  constructor(private configService: ConfigService) { }

  createModuleConfig(): OidcModuleOptions {
    const config = {
      issuer: this.configService.get('OIDC_ISSUER'),
      clientMetadata: {
        client_id: this.configService.get('OIDC_CLIENT_ID'),
        client_secret: this.configService.get('OIDC_CLIENT_SECRET'),
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
