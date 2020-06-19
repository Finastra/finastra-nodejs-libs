import { PassportStrategy } from '@nestjs/passport';
import { Strategy, TokenSet } from 'openid-client';
import { OidcStrategyOptions, getUserInfo, OidcHelpers } from '../utils';

export class OidcStrategy extends PassportStrategy(Strategy, 'oidc') {
  userInfoCallback: any;
  constructor(private oidcHelpers: OidcStrategyOptions) {
    super({
      client: oidcHelpers.client,
      params: oidcHelpers.config.authParams,
      passReqToCallback: false,
      usePKCE: oidcHelpers.config.usePKCE,
    });
    this.userInfoCallback = oidcHelpers.config.userInfoCallback;
  }

  async validate(tokenset: TokenSet): Promise<any> {
    let userinfo = await getUserInfo(tokenset.access_token, this.oidcHelpers);

    const id_token = tokenset.id_token;
    const access_token = tokenset.access_token;
    const refresh_token = tokenset.refresh_token;
    const user = {
      id_token,
      access_token,
      refresh_token,
      userinfo,
    };
    return user;
  }
}

export class OidcStrategies {
  tenants: any = {};

  constructor(private oidcHelpers: OidcHelpers) {
    oidcHelpers.idps.forEach(idp => {
      this.tenants[idp.config.id] = new OidcStrategy(idp);
    });
  }
}
