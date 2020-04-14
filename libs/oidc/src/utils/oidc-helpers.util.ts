import { Injectable } from '@nestjs/common';
import { JWKS } from 'jose';
import { OidcModuleOptions } from '../interfaces';
import { Client, Issuer } from 'openid-client';

@Injectable()
export class OidcHelpers {
  constructor(
    public tokenStore: JWKS.KeyStore,
    public client: Client,
    public config: OidcModuleOptions,
  ) {}
}

export async function getTokenStore(issuer: string) {
  const TrustIssuer = await Issuer.discover(issuer);
  return await TrustIssuer.keystore();
}
