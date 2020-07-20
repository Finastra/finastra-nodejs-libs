import { Injectable } from '@nestjs/common';
import { JWKS } from 'jose';
import { OidcModuleOptions, IdentityProviderOptions } from '../interfaces';
import { Client, Issuer } from 'openid-client';
import axios from 'axios';
import { stringify } from 'querystring';

@Injectable()
export class OidcHelpers {
  constructor(
    public tokenStore: JWKS.KeyStore,
    public client: Client,
    public config: OidcModuleOptions,
    public TrustIssuer: Issuer<Client>,
  ) {}
}

export async function getTokenStore(issuer: string) {
  const TrustIssuer = await Issuer.discover(issuer);
  return await TrustIssuer.keystore();
}

export function isExpired(expiresAt: number) {
  if (expiresAt != null) {
    let remainingTime = expiresAt - Date.now() / 1000;
    return remainingTime <= 0;
  }
  return false;
}

export async function refreshToken(
  authorizationName: string,
  authToken: IdentityProviderOptions,
  oidcHelpers: OidcHelpers,
  options: OidcModuleOptions,
) {
  if (
    !authToken.accessToken ||
    !authToken.refreshToken ||
    !authToken.tokenEndpoint
  ) {
    return;
  }

  const response = await axios.request({
    url: authToken.tokenEndpoint,
    method: 'post',
    timeout: Number(options.defaultHttpOptions.timeout),
    // http://openid.net/specs/openid-connect-core-1_0.html#RefreshingAccessToken
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: stringify({
      client_id: oidcHelpers.config.clientMetadata.client_id,
      client_secret: oidcHelpers.config.clientMetadata.client_secret,
      grant_type: 'refresh_token',
      refresh_token: authToken.refreshToken,
      scope: authToken.scope,
    }),
  });
  if (response.status == 200) {
    return {
      name: authorizationName,
      authInfo: {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt:
          Number(response.data.expires_at) || response.data.expires_in
            ? Date.now() / 1000 + Number(response.data.expires_in)
            : null,
      },
    };
  } else {
    return;
  }
}

export function updateUserAuthToken(
  data: { name: string; authInfo: Partial<IdentityProviderOptions> }[],
  req,
) {
  for (const item of data) {
    if (item) {
      req.user.authTokens[item.name].accessToken = item.authInfo.accessToken;
      req.user.authTokens[item.name].refreshToken = item.authInfo.refreshToken;
      req.user.authTokens[item.name].expiresAt = item.authInfo.expiresAt;
    }
  }
}
