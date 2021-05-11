import { Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, TokenSet } from 'openid-client';
import { ChannelType, OidcUser } from '../interfaces';
import { OidcService } from '../services';
import { authenticateExternalIdps, getUserInfo } from '../utils';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  readonly logger = new Logger(OidcStrategy.name);

  protected _params: any;
  userInfoCallback: any;

  constructor(private oidcService: OidcService, private idpKey: string, private channelType?: ChannelType) {
    super({
      client: oidcService.idpInfos[idpKey].client,
      params: oidcService.options.authParams,
      passReqToCallback: false,
      usePKCE: oidcService.options.usePKCE,
    });
    this.userInfoCallback = oidcService.options.userInfoCallback;
  }

  public updateRedirectUri(value) {
    this._params.redirect_uri = value
  }

  async validate(tokenset: TokenSet): Promise<OidcUser> {
    this.logger.debug(`https://jwt.io/#debugger-io?token=${tokenset.access_token}`);

    const externalIdps = await authenticateExternalIdps(this.oidcService.options.externalIdps);
    const id_token = tokenset.id_token;
    let userinfo = await getUserInfo(id_token, this.oidcService, this.idpKey);
    userinfo['channel'] = this.channelType;

    const expiresAt =
      Number(tokenset.expires_at) ||
      (Number(tokenset.expires_in) ? Date.now() / 1000 + Number(tokenset.expires_in) : null);
    const authTokens = {
      accessToken: tokenset.access_token,
      refreshToken: tokenset.refresh_token,
      tokenEndpoint: this.oidcService.idpInfos[this.idpKey].trustIssuer.metadata.token_endpoint,
      expiresAt,
    };
    const user: OidcUser = {
      id_token,
      userinfo,
      authTokens,
      ...externalIdps,
    };
    return user;
  }
}
