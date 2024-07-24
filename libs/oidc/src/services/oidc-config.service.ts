import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthorizationParameters, ClientMetadata, generators } from 'openid-client';
import { OidcEnvironmentVariables, OidcModuleOptions, OidcOptionsFactory, UserInfoMethod } from '../interfaces';

@Injectable()
export class OidcConfigService implements OidcOptionsFactory {
  #options: OidcModuleOptions;

  getOptions(defaultModuleOptions?: OidcModuleOptions): OidcModuleOptions {
    const newOptions = {
      ...defaultModuleOptions ?? {},
      ...this.#options ?? this.createModuleConfig(),
    } as OidcModuleOptions;
    newOptions.authParams = {
      ...defaultModuleOptions?.authParams ?? {},
      ...this.#options.authParams ?? this.createModuleConfig().authParams,
    };
    return newOptions;
  }

  readonly logger = new Logger(OidcConfigService.name);

  constructor(private configService: ConfigService<OidcEnvironmentVariables>) {
    this.createModuleConfig()
  }

  createModuleConfig(): OidcModuleOptions {
    const issuer = this.configService.get('OIDC_ISSUER');
    const client_id = this.configService.get('OIDC_CLIENT_ID');
    const origin = this.configService.get('OIDC_ORIGIN');
    const redirect_uri = this.configService.get('OIDC_REDIRECT_URI') ?? `${origin}/login/callback`;
    const nonce = generators.nonce();

    this.logger.log(`
issuer        : ${issuer}
client_id     : ${client_id}
origin        : ${origin}
redirect_uri  : ${redirect_uri}`);

    const options = {
      issuer,
      origin,
      clientMetadata: {
        client_id,
        client_secret: this.configService.get('OIDC_CLIENT_SECRET'),
        redirect_uris: [redirect_uri, `${origin}/login/callback`],
      } as ClientMetadata,
      authParams: {
        scope: this.configService.get('OIDC_SCOPE'),
        resource: this.configService.get('OIDC_RESOURCE'),
        nonce,
        redirect_uri: redirect_uri,
        clockTolerance: this.configService.get('CLOCK_TOLERANCE') ?? 10,
      } as AuthorizationParameters,
      userInfoMethod: this.configService.get('USER_INFO_METHOD') ?? UserInfoMethod.token,
      defaultHttpOptions: {
        timeout: this.configService.get('TIMEOUT') ?? 40000,
      },
    };
    this.#options = options;
    this.logger.log(options);
    return options
  }
}

