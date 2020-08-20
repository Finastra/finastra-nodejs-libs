import { Injectable, Inject } from '@nestjs/common';
import { OidcModuleOptions } from '../interfaces';
import { OidcHelpers } from '../utils';
import { JWKS } from 'jose';
import { Client, Issuer } from 'openid-client';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';

@Injectable()
export class OidcService {
  helpers: OidcHelpers;
  isMultitenant: boolean = false;

  constructor(@Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions) {
    this.isMultitenant = !!this.options.issuerOrigin;
  }

  init(
    tokenStore: JWKS.KeyStore,
    client: Client,
    config: OidcModuleOptions,
    TrustIssuer: Issuer<Client>,
  ) {
    this.helpers = new OidcHelpers(tokenStore, client, config, TrustIssuer);
    return this.helpers;
  }
}
