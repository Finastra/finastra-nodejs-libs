import { PassportStrategy } from '@nestjs/passport';
import { Strategy, TokenSet, Client } from 'openid-client';
import { OidcHelpers, getUserInfo, authenticateExternalIdps } from '../utils';
import { ChannelType } from '../interfaces';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  userInfoCallback: any;
  constructor(
    private oidcHelpers: OidcHelpers,
    private channelType?: ChannelType,
  ) {
    super({
      client: oidcHelpers.client,
      params: oidcHelpers.config.authParams,
      passReqToCallback: false,
      usePKCE: oidcHelpers.config.usePKCE,
    });
    this.userInfoCallback = oidcHelpers.config.userInfoCallback;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const externalIdps = await authenticateExternalIdps(this.oidcHelpers);
    const id_token = tokenset.id_token;
    let userinfo = await getUserInfo(id_token, this.oidcHelpers);
    userinfo['channel'] = this.channelType;

    const expiresAt =
      Number(tokenset.expires_at) ||
      (Number(tokenset.expires_in)
        ? Date.now() / 1000 + Number(tokenset.expires_in)
        : null);
    const authTokens = {
      accessToken: tokenset.access_token,
      refreshToken: tokenset.refresh_token,
      tokenEndpoint: this.oidcHelpers.TrustIssuer.metadata.token_endpoint,
      expiresAt,
    };
    const user = {
      id_token,
      userinfo,
      authTokens,
      ...externalIdps,
    };
    return user;
  }
}
