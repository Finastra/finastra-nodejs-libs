import {
  Controller,
  Get,
  Request,
  Res,
  Inject,
  Logger,
  Param,
  Next,
  OnModuleInit,
} from '@nestjs/common';
import { Response } from 'express';

import { OIDC_MODULE_OPTIONS, SESSION_STATE_COOKIE } from '../oidc.constants';
import {
  OidcModuleOptions,
  ChannelType,
} from '../interfaces/oidc-module-options.interface';
import { Public } from '../decorators/public.decorator';
import { join } from 'path';
import { refreshToken, updateUserAuthToken, isExpired } from '../utils';
import { OidcStrategy } from '../strategies';
import { Issuer, custom } from 'openid-client';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from '../mocks';
import passport = require('passport');
import { OidcService } from '../services';
import * as fs from 'fs';
import { isAvailableRouteForMultitenant } from '../decorators';

const logger = new Logger('AuthController');

@Controller()
export class AuthController implements OnModuleInit {
  strategy: any;
  isMultitenant = false;
  constructor(
    @Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions,
    public oidcService: OidcService,
  ) {
    this.isMultitenant = this.oidcService.isMultitenant;
  }

  async onModuleInit() {
    if (!this.oidcService.isMultitenant) {
      this.strategy = await this.createStrategy();
    }
  }

  @Get('/user')
  user(@Request() req) {
    return req.user.userinfo;
  }

  // Single tenancy

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/login')
  loginSingleTenant(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('login/callback')
  loginSingleTenantCallback(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/logout')
  async logout(@Request() req, @Res() res: Response, @Param() params) {
    if (!req.isAuthenticated()) {
      res.sendStatus(404);
      return;
    }
    const id_token = req.user ? req.user.id_token : undefined;
    req.logout();
    req.session.destroy(async (error: any) => {
      const end_session_endpoint = this.oidcService.helpers.TrustIssuer.metadata
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

  @isAvailableRouteForMultitenant(false)
  @Get('/check-token')
  async checkTokens(@Request() req, @Res() res) {
    const refresh = req.query.refresh == 'true'; //if the refresh of the token is requested

    const authTokens = req.user.authTokens;
    let valid = true;
    let needsRefresh = false;
    valid = valid && !isExpired(authTokens.expiresAt);
    if (
      authTokens.expiresAt &&
      authTokens.expiresAt - Date.now() / 1000 <
        this.oidcService.helpers.config.idleTime
    ) {
      needsRefresh = true;
    }
    if (valid) {
      if (refresh && needsRefresh) {
        return await refreshToken(authTokens, this.oidcService.helpers)
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

  @isAvailableRouteForMultitenant(false)
  @Get('/refresh-token')
  refreshTokens(@Request() req, @Res() res) {
    const { authTokens } = req.user;
    authTokens.channel = req.params['channelType'];
    return refreshToken(authTokens, this.oidcService.helpers)
      .then(data => {
        updateUserAuthToken(data, req);
        res.sendStatus(200);
      })
      .catch(err => {
        res.status(401).send(err);
      });
  }

  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/loggedout')
  loggedout(@Res() res: Response, @Param() params) {
    let data = fs
      .readFileSync(join(__dirname, '../assets/loggedout.html'))
      .toString();
    let prefix =
      params.tenantId && params.channelType
        ? `/${params.tenantId}/${params.channelType}`
        : '';
    if (data) res.send(data.replace('rootUrl', `${prefix}/login`));
  }

  // Multitenancy
  @Public()
  @isAvailableRouteForMultitenant(false)
  @Get('/:tenantId/:channelType/login')
  loginMultitenant(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(true)
  @Get('/:tenantId/:channelType/login/callback')
  loginMultitenantCallback(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(true)
  @Get('/:tenantId/:channelType/logout')
  async logoutMultitenant(
    @Request() req,
    @Res() res: Response,
    @Param() params,
  ) {
    return this.logout(req, res, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(true)
  @Get('/:tenantId/:channelType/loggedout')
  loggedoutMultitenant(@Res() res: Response, @Param() params) {
    return this.loggedout(res, params);
  }

  @isAvailableRouteForMultitenant(true)
  @Get('/:tokenId/:channelType/check-token')
  async checkTokensMultitenant(@Request() req, @Res() res) {
    return this.checkTokens(req, res);
  }

  @isAvailableRouteForMultitenant(true)
  @Get('/:tokenId/:channelType/refresh-token')
  refreshTokensMultitenant(@Request() req, @Res() res) {
    return this.refreshTokens(req, res);
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
      this.oidcService.init(tokenStore, client, this.options, TrustIssuer);

      strategy = new OidcStrategy(this.oidcService.helpers);
      return strategy;
    } catch (err) {
      console.log(err);
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

  async login(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    var strategy =
      this.strategy ||
      (await this.createStrategy(params.tenantId, params.channelType));
    let prefix =
      params.tenantId && params.channelType
        ? `/${params.tenantId}/${params.channelType}`
        : '';
    passport.authenticate(strategy, {
      ...req.options,
      successRedirect: `${prefix}/`,
      failureRedirect: `${prefix}/login`,
    })(req, res, next);
  }
}
