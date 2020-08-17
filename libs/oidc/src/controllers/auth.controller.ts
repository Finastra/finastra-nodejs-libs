import {
  Controller,
  Get,
  Request,
  Res,
  Inject,
  Logger,
  Param,
  Next,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';

import { OIDCGuard } from '../guards/oidc.guard';
import { OIDC_MODULE_OPTIONS, SESSION_STATE_COOKIE } from '../oidc.constants';
import {
  OidcModuleOptions,
  ChannelType,
} from '../interfaces/oidc-module-options.interface';
import { Public } from '../decorators/public.decorator';
import { join } from 'path';
import {
  OidcHelpers,
  refreshToken,
  updateUserAuthToken,
  isExpired,
} from '../utils';
import { OidcStrategy } from '../strategies';
import { Issuer, custom } from 'openid-client';
import { v4 as uuid } from 'uuid';
import { MOCK_CLIENT_INSTANCE } from '../mocks';
import {} from '@nestjs/passport';
import passport = require('passport');

const logger = new Logger('AuthController');

@Controller()
export class AuthController {
  multitenancy: boolean;
  constructor(
    @Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions,
    private oidcHelpers: OidcHelpers,
  ) {
    this.multitenancy = !this.oidcHelpers.config.issuer;
  }

  // Single tenancy login

  @Public()
  @UseGuards(OIDCGuard)
  @Get('/login')
  loginSingleTenant(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params, this.multitenancy);
  }

  @Public()
  @UseGuards(OIDCGuard)
  @Get('login/callback')
  loginSingleTenantCallback(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params, this.multitenancy);
  }

  // Multitenancy login

  @Public()
  @UseGuards(OIDCGuard)
  @Get('/:tenantId/:channelType/login')
  loginMultitenant(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params, !this.multitenancy);
  }

  @Public()
  @UseGuards(OIDCGuard)
  @Get('/:tenantId/:channelType/login/callback')
  loginMultitenantCallback(
    @Request() req,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.login(req, res, next, params, !this.multitenancy);
  }

  @Get('/user')
  user(@Request() req) {
    return req.user.userinfo;
  }

  @Public()
  @Get('/logout')
  async logout(@Request() req, @Res() res: Response) {
    const id_token = req.user ? req.user.id_token : undefined;
    req.logout();
    req.session.destroy(async (error: any) => {
      const end_session_endpoint = this.oidcHelpers.TrustIssuer.metadata
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
        res.redirect('/loggedout');
      }
    });
  }

  @Public()
  @Get('/loggedout')
  loggedout(@Res() res: Response) {
    res.sendFile(join(__dirname, '../assets/loggedout.html'));
  }

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
        this.oidcHelpers.config.idleTime
    ) {
      needsRefresh = true;
    }
    if (valid) {
      if (refresh && needsRefresh) {
        return await refreshToken(authTokens, this.oidcHelpers, this.options)
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

  @Get('/refresh-token')
  refreshTokens(@Request() req, @Res() res) {
    const { authTokens } = req.user;
    return refreshToken(authTokens, this.oidcHelpers, this.options)
      .then(data => {
        updateUserAuthToken(data, req);
        res.sendStatus(200);
      })
      .catch(err => {
        res.status(401).send(err);
      });
  }

  async createStrategy(tenantId?, channelType?) {
    var strategy;
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
            clientMetadata = this.options['b2e'].clientMetadata;
            break;
          default:
          case ChannelType.b2c:
            clientMetadata = this.options['b2c'].clientMetadata;
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
      this.oidcHelpers = new OidcHelpers(
        tokenStore,
        client,
        this.options,
        TrustIssuer,
      );

      strategy = new OidcStrategy(this.oidcHelpers);
      return strategy;
    } catch (err) {
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
    unavailableRoute: boolean,
  ) {
    if (unavailableRoute) {
      res.sendStatus(404);
      return;
    }
    var strategy = await this.createStrategy(
      params.tenantId,
      params.channelType,
    );
    passport.authenticate(strategy, {
      successRedirect: '/',
      failureRedirect:
        params.tenantId && params.channelType
          ? `${params.tenantId}/${params.channelType}/login`
          : '/login',
    })(req, res, next);
  }
}
