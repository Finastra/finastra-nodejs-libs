import { Injectable, Logger } from '@nestjs/common';
import { JWKS } from 'jose';
import { OidcModuleOptions, IdentityProvider } from '../interfaces';
import { Client, Issuer } from 'openid-client';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from '../mocks';

export class OidcStrategyOptions {
  constructor(
    public tokenStore: JWKS.KeyStore,
    public client: Client,
    public config: IdentityProvider,
  ) {}
}

@Injectable()
export class OidcHelpers {
  constructor(
    public idps: OidcStrategyOptions[],
    public config: OidcModuleOptions,
  ) {}
}

export async function getTokenStore(issuer: string) {
  const TrustIssuer = await Issuer.discover(issuer);
  return await TrustIssuer.keystore();
}

export async function getIssuerInfo(config: OidcModuleOptions) {
  const logger = new Logger('OidcModule');

  const origin = config.origin;

  return Promise.all(
    config.identityProviders.map(async idp => {
      try {
        const issuer = idp.issuer;
        const TrustIssuer = await Issuer.discover(issuer);
        const client = new TrustIssuer.Client(idp.clientMetadata);
        const tokenStore = await TrustIssuer.keystore();
        idp.authParams.redirect_uri = `${origin}/login/callback`;
        idp.authParams.nonce =
          idp.authParams.nonce === 'true' ? uuid() : idp.authParams.nonce;
        return new OidcStrategyOptions(tokenStore, client, idp);
      } catch (err) {
        const docUrl =
          'https://github.com/fusionfabric/finastra-nodejs-libs/blob/develop/libs/oidc/README.md';
        const msg = `Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : ${docUrl}`;
        logger.error(msg);
        logger.log('Terminating application');
        process.exit(1);
        return {
          client: MOCK_CLIENT_INSTANCE,
          config: {
            authParams: undefined,
            usePKCE: undefined,
          },
        }; // Used for unit test
      }
    }),
  );
}
