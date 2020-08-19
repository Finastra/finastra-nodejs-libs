import { Injectable, Inject } from '@nestjs/common';
import { OidcModuleOptions } from '../interfaces';
import { OidcHelpers } from '../utils';
import { JWKS } from 'jose';
import { Client, Issuer } from 'openid-client';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';

@Injectable()
export class OidcHelpersService {
  oidcHelpers: OidcHelpers;
  constructor(@Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions) {
    this.options;
  }

  init(
    tokenStore: JWKS.KeyStore,
    client: Client,
    config: OidcModuleOptions,
    TrustIssuer: Issuer<Client>,
  ) {
    this.oidcHelpers = new OidcHelpers(tokenStore, client, config, TrustIssuer);
    return this.oidcHelpers;
  }
}
