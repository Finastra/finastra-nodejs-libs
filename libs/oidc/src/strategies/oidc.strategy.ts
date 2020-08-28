import { PassportStrategy } from '@nestjs/passport';
import { Strategy, TokenSet } from 'openid-client';
import { getUserInfo, authenticateExternalIdps } from '../utils';
import { ChannelType } from '../interfaces';
import { OidcService } from '../services';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  userInfoCallback: any;
  constructor(
    private oidcService: OidcService,
    private channelType?: ChannelType,
  ) {
    super({
      client: oidcService.client,
      params: oidcService.options.authParams,
      passReqToCallback: false,
      usePKCE: oidcService.options.usePKCE,
    });
    this.userInfoCallback = oidcService.options.userInfoCallback;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    const externalIdps = await authenticateExternalIdps(
      this.oidcService.options.externalIdps,
    );
    const id_token = tokenset.id_token;
    let userinfo = await getUserInfo(id_token, this.oidcService);
    userinfo['channel'] = this.channelType;

    const expiresAt =
      Number(tokenset.expires_at) ||
      (Number(tokenset.expires_in)
        ? Date.now() / 1000 + Number(tokenset.expires_in)
        : null);
    const authTokens = {
      accessToken: tokenset.access_token,
      refreshToken: tokenset.refresh_token,
      tokenEndpoint: this.oidcService.trustIssuer.metadata.token_endpoint,
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
