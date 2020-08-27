import {
  Injectable,
  Inject,
  Logger,
  Res,
  Next,
  Param,
  Req,
  OnModuleInit,
} from '@nestjs/common';
import {
  OidcModuleOptions,
  ChannelType,
  IdentityProviderOptions,
} from '../interfaces';
import { JWKS } from 'jose';
import { Client, Issuer, custom } from 'openid-client';
import { OIDC_MODULE_OPTIONS, SESSION_STATE_COOKIE } from '../oidc.constants';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from '../mocks';
import { OidcStrategy } from '../strategies';
import passport = require('passport');
import { Response, Request } from 'express';
import { readFileSync } from 'fs';
import { join } from 'path';
import { stringify } from 'querystring';
import axios from 'axios';

const logger = new Logger('OidcService');
@Injectable()
export class OidcService implements OnModuleInit {
  client: Client;
  isMultitenant: boolean = false;
  strategy: any;
  tokenStore: JWKS.KeyStore;
  trustIssuer: Issuer<Client>;
  constructor(@Inject(OIDC_MODULE_OPTIONS) public options: OidcModuleOptions) {
    this.isMultitenant = !!this.options.issuerOrigin;
  }

  async onModuleInit() {
    if (!this.isMultitenant) {
      this.strategy = await this.createStrategy();
    }
  }

  async createStrategy(tenantId?, channelType?) {
    let strategy;
    if (this.options.defaultHttpOptions) {
      custom.setHttpOptionsDefaults(this.options.defaultHttpOptions);
    }

    try {
      let issuer, redirectUri, clientMetadata;
      if (this.options.issuer) {
        issuer = this.options.issuer;
        redirectUri = `${this.options.origin}/login/callback`;
        clientMetadata = this.options.clientMetadata;
      } else {
        issuer = `${this.options['issuerOrigin']}/${tenantId}/.well-known/openid-configuration`;
        redirectUri = `${this.options.origin}/${tenantId}/${channelType}/login/callback`;
        switch (channelType.toLowerCase()) {
          case ChannelType.b2e:
            clientMetadata = this.options[ChannelType.b2e].clientMetadata;
            break;
          default:
          case ChannelType.b2c:
            clientMetadata = this.options[ChannelType.b2c].clientMetadata;
            break;
        }
      }
      this.trustIssuer = await Issuer.discover(issuer);
      this.client = new this.trustIssuer.Client(clientMetadata);
      this.tokenStore = await this.trustIssuer.keystore();
      this.options.authParams.redirect_uri = redirectUri;
      this.options.authParams.nonce =
        this.options.authParams.nonce === 'true'
          ? uuid()
          : this.options.authParams.nonce;

      strategy = new OidcStrategy(this, channelType);
      return strategy;
    } catch (err) {
      if (this.isMultitenant) {
        logger.error(err);
        return;
      }
      const docUrl =
        'https://github.com/fusionfabric/finastra-nodejs-libs/blob/develop/libs/oidc/README.md';
      const msg = `Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : ${docUrl}`;
      logger.error(msg);
      logger.log('Terminating application');
      process.exit(1);
      return {
        ...this.options,
        client: MOCK_CLIENT_INSTANCE,
        config: {
          authParams: undefined,
          usePKCE: undefined,
        },
      }; // Used for unit test
    }
  }

  isExpired(expiresAt: number) {
    if (expiresAt != null) {
      let remainingTime = expiresAt - Date.now() / 1000;
      return remainingTime <= 0;
    }
    return false;
  }

  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    var strategy =
      this.strategy ||
      (await this.createStrategy(params.tenantId, params.channelType));
    if (!strategy) {
      res.sendStatus(404);
      return;
    }
    let prefix =
      params.tenantId && params.channelType
        ? `/${params.tenantId}/${params.channelType}`
        : '';
    passport.authenticate(strategy, {
      ...req['options'],
      successRedirect: `${prefix}/`,
      failureRedirect: `${prefix}/login`,
    })(req, res, next);
  }

  async logout(@Req() req, @Res() res: Response, @Param() params) {
    if (!req.isAuthenticated()) {
      res.sendStatus(404);
      return;
    }
    const id_token = req.user ? req.user.id_token : undefined;
    req.logout();
    req.session.destroy(async (error: any) => {
      const end_session_endpoint = this.trustIssuer.metadata
        .end_session_endpoint;

      if (end_session_endpoint) {
        res.redirect(
          `${end_session_endpoint}?post_logout_redirect_uri=${
            this.options.redirectUriLogout
              ? this.options.redirectUriLogout
              : this.options.origin
          }&client_id=${this.options.clientMetadata.client_id}${
            id_token ? '&id_token_hint=' + id_token : ''
          }`,
        );
      } else {
        // Save logged out state for 15 min
        res.cookie(SESSION_STATE_COOKIE, 'logged out', {
          maxAge: 15 * 1000 * 60,
        });
        let prefix =
          params.tenantId && params.channelType
            ? `/${params.tenantId}/${params.channelType}`
            : '';
        res.redirect(`${prefix}/loggedout`);
      }
    });
  }

  async checkToken(@Req() req: Request, @Res() res: Response) {
    const refresh = req.query.refresh == 'true'; //if the refresh of the token is requested

    const authTokens = req.user['authTokens'];
    let valid = true;
    let needsRefresh = false;
    valid = valid && !this.isExpired(authTokens.expiresAt);
    if (
      authTokens.expiresAt &&
      authTokens.expiresAt - Date.now() / 1000 < this.options.idleTime
    ) {
      needsRefresh = true;
    }
    if (valid) {
      if (refresh && needsRefresh) {
        authTokens.channel = req.user['userinfo'].channel;
        return await this._refreshToken(authTokens)
          .then(data => {
            this._updateUserAuthToken(data, req);
            res.sendStatus(200);
          })
          .catch(err => {
            res.status(401).send(err);
          });
      } else {
        return res.sendStatus(200);
      }
    } else {
      return res
        .status(401)
        .send('Your session has expired. \n\nPlease log in again');
    }
  }

  refreshTokens(@Req() req, @Res() res) {
    const { authTokens } = req.user;
    authTokens.channel = req.user.userinfo.channel;
    return this._refreshToken(authTokens)
      .then(data => {
        this._updateUserAuthToken(data, req);
        res.sendStatus(200);
      })
      .catch(err => {
        res.status(401).send(err);
      });
  }

  loggedOut(@Res() res: Response, @Param() params) {
    let data = readFileSync(
      join(__dirname, '../assets/loggedout.html'),
    ).toString();
    let prefix =
      params.tenantId && params.channelType
        ? `/${params.tenantId}/${params.channelType}`
        : '';
    if (data) res.send(data.replace('rootUrl', `${prefix}/login`));
  }

  async _refreshToken(authToken: IdentityProviderOptions) {
    if (
      !authToken.accessToken ||
      !authToken.refreshToken ||
      !authToken.tokenEndpoint
    ) {
      throw new Error('Missing token endpoint');
    }

    let clientMetadata;
    switch (authToken.channel) {
      case ChannelType.b2c:
        clientMetadata = this.options[ChannelType.b2c].clientMetadata;
        break;
      case ChannelType.b2e:
        clientMetadata = this.options[ChannelType.b2e].clientMetadata;
        break;
      default:
        clientMetadata = this.options.clientMetadata;
        break;
    }

    const response = await axios.request({
      url: authToken.tokenEndpoint,
      method: 'post',
      timeout: Number(this.options.defaultHttpOptions.timeout),
      // http://openid.net/specs/openid-connect-core-1_0.html#RefreshingAccessToken
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify({
        client_id: clientMetadata.client_id,
        client_secret: clientMetadata.client_secret,
        grant_type: 'refresh_token',
        refresh_token: authToken.refreshToken,
        scope: authToken.scope,
      }),
    });

    if (response.status == 200) {
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresAt:
          Number(response.data.expires_at) ||
          (response.data.expires_in
            ? Date.now() / 1000 + Number(response.data.expires_in)
            : null),
      };
    } else {
      throw new Error(response.data);
    }
  }

  _updateUserAuthToken(data: Partial<IdentityProviderOptions>, req) {
    req.user.authTokens.accessToken = data.accessToken;
    req.user.authTokens.refreshToken = data.refreshToken;
    req.user.authTokens.expiresAt = data.expiresAt;
  }
}
