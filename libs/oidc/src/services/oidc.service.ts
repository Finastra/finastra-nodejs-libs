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
import { OidcModuleOptions, ChannelType } from '../interfaces';
import {
  OidcHelpers,
  refreshToken,
  updateUserAuthToken,
  isExpired,
} from '../utils';
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

@Injectable()
export class OidcService implements OnModuleInit {
  private logger = new Logger(OidcService.name);
  helpers: OidcHelpers;
  strategy: any;
  isMultitenant: boolean = false;

  constructor(@Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions) {
    this.isMultitenant = !!this.options.issuerOrigin;
  }

  async onModuleInit() {
    if (!this.isMultitenant) {
      this.strategy = await this.createStrategy();
    }
  }

  init(
    tokenStore: JWKS.KeyStore,
    client: Client,
    config: OidcModuleOptions,
    TrustIssuer: Issuer<Client>,
  ) {
    this.helpers = new OidcHelpers(tokenStore, client, config, TrustIssuer);
    return this.helpers;
  }

  async createStrategy(tenantId?, channelType?) {
    let strategy;
    if (this.options.defaultHttpOptions) {
      custom.setHttpOptionsDefaults(this.options.defaultHttpOptions);
    }

    try {
      let issuer, redirectUri, clientMetadata, TrustIssuer, client, tokenStore;
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
      TrustIssuer = await Issuer.discover(issuer);
      client = new TrustIssuer.Client(clientMetadata);
      tokenStore = await TrustIssuer.keystore();
      this.options.authParams.redirect_uri = redirectUri;
      this.options.authParams.nonce =
        this.options.authParams.nonce === 'true'
          ? uuid()
          : this.options.authParams.nonce;
      this.init(tokenStore, client, this.options, TrustIssuer);

      strategy = new OidcStrategy(this.helpers, channelType);
      return strategy;
    } catch (err) {
      if (this.isMultitenant) {
        this.logger.error(err);
        return;
      }
      const docUrl =
        'https://github.com/fusionfabric/finastra-nodejs-libs/blob/develop/libs/oidc/README.md';
      const msg = `Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : ${docUrl}`;
      this.logger.error(msg);
      this.logger.log('Terminating application');
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
      const end_session_endpoint = this.helpers.TrustIssuer.metadata
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
    valid = valid && !isExpired(authTokens.expiresAt);
    if (
      authTokens.expiresAt &&
      authTokens.expiresAt - Date.now() / 1000 < this.helpers.config.idleTime
    ) {
      needsRefresh = true;
    }
    if (valid) {
      if (refresh && needsRefresh) {
        authTokens.channel = req.user['userinfo'].channel;
        return await refreshToken(authTokens, this.helpers)
          .then(data => {
            updateUserAuthToken(data, req);
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
    return refreshToken(authTokens, this.helpers)
      .then(data => {
        updateUserAuthToken(data, req);
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
}
