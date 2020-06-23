import { Issuer } from 'openid-client';
import axios from 'axios';
import { stringify } from 'querystring';
import { Logger } from '@nestjs/common';
import { OidcHelpers } from './oidc-helpers.util';

const logger = new Logger('ExternalIdps');

export async function authenticateExternalIdps(oidcHelpers: OidcHelpers) {
  const tokens = {};
  const externalIdps = oidcHelpers.config.externalIdps;
  const promises = [];
  for (let idpName in externalIdps) {
    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          const idp = externalIdps[idpName];
          const tokenEndpoint = (await Issuer.discover(idp.issuer)).metadata
            .token_endpoint;
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
          tokens[idpName] = idp;
          resolve();
        } catch (err) {
          reject(err);
        }
      }),
    );
  }
  return await Promise.all(promises)
    .then(() => tokens)
    .catch(err => {
      logger.error(`Error requesting external IDP token`);
      return;
    });
}
