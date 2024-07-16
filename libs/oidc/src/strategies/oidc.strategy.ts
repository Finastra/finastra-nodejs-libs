import { UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Client, Strategy, TokenSet } from 'openid-client';
import { ExternalIdps, OidcModuleOptions, OidcUser, UserInfo } from '../interfaces';
import { authenticateExternalIdps, getUserInfo } from '../utils';

export const STRATEGY_NAME = 'oidc';

// export class OidcStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
//   readonly logger = new Logger(OidcStrategy.name);

//   userInfoCallback: any;

//   constructor(private oidcService: OidcService, private idpKey: string, private channelType?: ChannelType) {
//     super({
//       client: oidcService.idpInfos[idpKey].client,
//       params: oidcService.options.authParams,
//       passReqToCallback: false,
//       usePKCE: oidcService.options.usePKCE,
//     });
//     this.userInfoCallback = oidcService.options.userInfoCallback;
//   }

//   async validate(tokenset: TokenSet): Promise<OidcUser> {
//     const externalIdps = await authenticateExternalIdps(this.oidcService.options.externalIdps);
//     const id_token = tokenset.id_token;
//     let userinfo = await getUserInfo(id_token, this.oidcService, this.idpKey);
//     userinfo['channel'] = this.channelType;

//     const expiresAt =
//       Number(tokenset.expires_at) ||
//       (Number(tokenset.expires_in) ? Date.now() / 1000 + Number(tokenset.expires_in) : null);
//     const authTokens = {
//       accessToken: tokenset.access_token,
//       refreshToken: tokenset.refresh_token,
//       tokenEndpoint: this.oidcService.idpInfos[this.idpKey].trustIssuer.metadata.token_endpoint,
//       expiresAt,
//       refreshExpiresIn: tokenset.refresh_expires_in,
//     };
//     const user: OidcUser = {
//       id_token,
//       userinfo,
//       authTokens,
//       ...externalIdps,
//     };
//     return user;
//   }
// }

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
    console.log(tokenset);
    const externalIdps: ExternalIdps | void[] = await authenticateExternalIdps(this.options.externalIdps);
    const id_token = tokenset.id_token;
    const userinfo = await getUserInfo(id_token, this.options, this.client);
    if (!userinfo) {
      throw new UnauthorizedException('UserInfo not available in validate method');
    }

    userinfo['channel'] = this.channelType;

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
  }
}