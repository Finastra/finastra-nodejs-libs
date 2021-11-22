import { Logger } from '@nestjs/common';
import axios from 'axios';
import { Issuer } from 'openid-client';
import { stringify } from 'querystring';
import { ExternalIdps, IdentityProviderOptions } from '../interfaces';

const logger = new Logger('ExternalIdps');

export async function authenticateExternalIdps(externalIdps: ExternalIdps): Promise<ExternalIdps | any> {
  const tokens: ExternalIdps = {};
  if (!externalIdps) return;
  const promises = Object.keys(externalIdps).map(async idpName => {
    tokens[idpName] = await clientCredentialsAuth(externalIdps[idpName]);
  });
  return await Promise.all(promises)
    .then(() => {
      return tokens;
    })
    .catch(error => {
      logger.error(error);
      logger.error(`Error requesting external IDP token`);
      return;
    });
}

export async function clientCredentialsAuth(idp: IdentityProviderOptions): Promise<IdentityProviderOptions> {
  const tokenEndpoint = (await Issuer.discover(idp.issuer)).metadata.token_endpoint;
  const reqBody = {
    client_id: idp.clientId,
    client_secret: idp.clientSecret,
    grant_type: 'client_credentials',
    scope: idp.scope,
  };
  const response = await axios.request({
    method: 'post',
    url: tokenEndpoint,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: stringify(reqBody),
  });
  const accessToken = response.data.access_token;
  idp.accessToken = accessToken;
  idp.expiresAt =
    response.data.expires_at || response.data.expires_in ? Date.now() / 1000 + Number(response.data.expires_in) : null;
  idp.tokenEndpoint = tokenEndpoint;
  return idp;
}
