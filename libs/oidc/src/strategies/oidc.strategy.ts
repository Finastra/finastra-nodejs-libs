import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Client, Strategy, TokenSet } from 'openid-client';
import { ExternalIdps, OidcModuleOptions, OidcUser, UserInfo } from '../interfaces';
import { STRATEGY_NAME } from '../oidc.constants';
import { authenticateExternalIdps, getUserInfo } from '../utils';

export class OidcPassportStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {

  userInfoCallback: (username: string, externalIdps: ExternalIdps) => UserInfo;

  constructor(
    private client: Client,
    private options: OidcModuleOptions,
    private channelType?: string,
  ) {
    super({
      client: client,
      params: {
        ...options.authParams,
        redirect_uri: options.authParams.redirect_uri,
        scope: options.authParams.scope,
      },

      passReqToCallback: false,
      usePKCE: options.usePKCE ?? false,
    });
    this.userInfoCallback = options.userInfoCallback;
  }

  async validate(tokenset: TokenSet): Promise<OidcUser> {
    const externalIdps: ExternalIdps | void[] = await authenticateExternalIdps(this.options.externalIdps);
    const id_token = tokenset.id_token;
    const userinfo = await getUserInfo(id_token, this.options, this.client);

    userinfo['channel'] = this.channelType;

    try {
      const expiresAt =
        Number(tokenset.expires_at) ||
        (Number(tokenset.expires_in) ? Date.now() / 1000 + Number(tokenset.expires_in) : null);
      const authTokens = {
        accessToken: tokenset.access_token,
        refreshToken: tokenset.refresh_token,
        tokenEndpoint: this.client.issuer.metadata.token_endpoint,
        expiresAt,
        refreshExpiresIn: tokenset.refresh_expires_in,
      };
      const user: OidcUser = {
        id_token,
        userinfo,
        authTokens,
        ...externalIdps,
      };
      return user;
    } catch (err) {
      throw new UnauthorizedException();
    }
  }
}