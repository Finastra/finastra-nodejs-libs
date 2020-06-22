import { PassportStrategy } from '@nestjs/passport';
import { Strategy, TokenSet, Issuer } from 'openid-client';
import { OidcHelpers, getUserInfo } from '../utils';
import axios from 'axios';
import { stringify } from 'querystring';
import { IdentityProviderOptions } from '../interfaces';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  userInfoCallback: any;
  constructor(private oidcHelpers: OidcHelpers) {
    super({
      client: oidcHelpers.client,
      params: oidcHelpers.config.authParams,
      passReqToCallback: false,
      usePKCE: oidcHelpers.config.usePKCE,
    });
    this.userInfoCallback = oidcHelpers.config.userInfoCallback;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const externalIdpTokens = await this.authenticateExternalIdps();
    let userinfo = await getUserInfo(tokenset.access_token, this.oidcHelpers);

    const id_token = tokenset.id_token;
    const access_token = tokenset.access_token;
    const refresh_token = tokenset.refresh_token;
    const user = {
      id_token,
      access_token,
      refresh_token,
      userinfo,
      externalIdpTokens,
    };
    return user;
  }

  private async authenticateExternalIdps() {
    const tokens = {};
    const externalIdps = this.oidcHelpers.config.externalIdps;
    const promises = externalIdps.map(async idp => {
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
      tokens[idp.issuer] = accessToken;
    });
    return await Promise.all(promises).then(() => tokens);
  }
}
