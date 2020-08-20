import { Injectable, Inject, Logger } from '@nestjs/common';
import { Issuer, custom } from 'openid-client';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';
import { OidcModuleOptions, ChannelType } from '../interfaces';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from '../mocks';
import { OidcStrategy } from '../strategies';
import { OidcService } from './oidc.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    @Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions,
    private oidcService: OidcService,
  ) {}

  async createStrategy(tenantId?, channelType?) {
    let strategy;
    if (this.options.defaultHttpOptions) {
      custom.setHttpOptionsDefaults(this.options.defaultHttpOptions);
    }

    try {
      let issuer, redirectUri, clientMetadata, TrustIssuer, client, tokenStore;
      if (this.options.issuer) {
        issuer = this.options.issuer;
        redirectUri = `${this.options.origin}/login/callback`;
        clientMetadata = this.options.clientMetadata;
      } else {
        issuer = `${this.options['issuerOrigin']}/${tenantId}/.well-known/openid-configuration`;
        redirectUri = `${this.options.origin}/${tenantId}/${channelType}/login/callback`;
        switch (channelType.toLowerCase()) {
          case ChannelType.b2e:
            clientMetadata = this.options[ChannelType.b2e].clientMetadata;
            break;
          default:
          case ChannelType.b2c:
            clientMetadata = this.options[ChannelType.b2c].clientMetadata;
            break;
        }
      }
      TrustIssuer = await Issuer.discover(issuer);
      client = new TrustIssuer.Client(clientMetadata);
      tokenStore = await TrustIssuer.keystore();
      this.options.authParams.redirect_uri = redirectUri;
      this.options.authParams.nonce =
        this.options.authParams.nonce === 'true'
          ? uuid()
          : this.options.authParams.nonce;
      this.oidcService.init(tokenStore, client, this.options, TrustIssuer);

      strategy = new OidcStrategy(this.oidcService.helpers);
      return strategy;
    } catch (err) {
      console.log(err);
      const docUrl =
        'https://github.com/fusionfabric/finastra-nodejs-libs/blob/develop/libs/oidc/README.md';
      const msg = `Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : ${docUrl}`;
      this.logger.error(msg);
      this.logger.log('Terminating application');
      process.exit(1);
      return {
        ...this.options,
        client: MOCK_CLIENT_INSTANCE,
        config: {
          authParams: undefined,
          usePKCE: undefined,
        },
      }; // Used for unit test
    }
  }
}
