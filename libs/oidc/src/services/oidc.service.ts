import { HttpStatus, Inject, Injectable, Logger, Next, OnModuleInit, Param, Req, Res } from '@nestjs/common';
import axios from 'axios';
import { Request, Response } from 'express';
import { JWKS } from 'jose';
import { Client, custom, Issuer } from 'openid-client';
import { stringify } from 'querystring';
import { v4 as uuid } from 'uuid';
import { ChannelType, IdentityProviderOptions, OidcModuleOptions } from '../interfaces';
import { OIDC_MODULE_OPTIONS, SESSION_STATE_COOKIE } from '../oidc.constants';
import { OidcStrategy } from '../strategies';
import { SSRPagesService } from './ssr-pages.service';
import passport = require('passport');

const logger = new Logger('OidcService');

declare module 'express-session' {
  interface SessionData {
    tenant: string;
    channel: string;
  }
}

@Injectable()
export class OidcService implements OnModuleInit {
  isMultitenant: boolean = false;
  strategy: any;
  idpInfos: {
    [tokenName: string]: {
      trustIssuer: Issuer<Client>;
      tokenStore: JWKS.KeyStore;
      client: Client;
      strategy: OidcStrategy;
    };
  } = {};

  constructor(
    @Inject(OIDC_MODULE_OPTIONS) public options: OidcModuleOptions,
    private ssrPagesService: SSRPagesService,
  ) {
    this.isMultitenant = !!this.options.issuerOrigin;
  }

  async onModuleInit() {
    if (!this.isMultitenant) {
      this.strategy = await this.createStrategy();
    }
  }

  async createStrategy(tenantId?: string, channelType?: ChannelType) {
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
        redirectUri = `${this.options.origin}/login/callback`;
        switch (channelType.toLowerCase()) {
          case ChannelType.b2e:
            clientMetadata = this.options[ChannelType.b2e].clientMetadata;
            break;
          case ChannelType.b2c:
            clientMetadata = this.options[ChannelType.b2c].clientMetadata;
            break;
        }
      }
      const trustIssuer = await Issuer.discover(issuer);
      const client = new trustIssuer.Client(clientMetadata);
      const tokenStore = await trustIssuer.keystore();

      const key = this.getIdpInfosKey(tenantId, channelType);

      this.idpInfos[key] = {
        trustIssuer,
        client,
        tokenStore,
        strategy,
      };
      this.options.authParams.redirect_uri = redirectUri;
      this.options.authParams.nonce = this.options.authParams.nonce === 'true' ? uuid() : this.options.authParams.nonce;

      strategy = new OidcStrategy(this, key, channelType);
      this.idpInfos[key].strategy = strategy;

      return strategy;
    } catch (err) {
      if (this.isMultitenant) {
        const errorMsg = {
          error: err.message,
          debug: {
            origin: this.options.origin,
            tenantId,
            channelType,
          },
        };
        logger.error(errorMsg);
        throw new Error();
      }
      const docUrl = 'https://github.com/finastra/finastra-nodejs-libs/blob/develop/libs/oidc/README.md';
      const msg = `Error accessing the issuer/tokenStore. Check if the url is valid or increase the timeout in the defaultHttpOptions : ${docUrl}`;
      logger.error(msg);
      logger.log('Terminating application');
      process.exit(1);
    }
  }

  getIdpInfosKey(tenantId, channelType): string {
    return `${tenantId}.${channelType}`;
  }

  isExpired(expiresAt: number): boolean {
    if (expiresAt != null) {
      let remainingTime = expiresAt - Date.now() / 1000;
      return remainingTime <= 0;
    }
    return false;
  }

  async login(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    try {
      const tenantId = params.tenantId || req.session['tenant'];
      const channel = params.channelType || req.session['channel'];

      const strategy =
        this.strategy ||
        (this.idpInfos[this.getIdpInfosKey(tenantId, channel)] &&
          this.idpInfos[this.getIdpInfosKey(tenantId, channel)].strategy) ||
        (await this.createStrategy(tenantId, channel));

      const prefix = channel && tenantId ? `/${tenantId}/${channel}` : '';

      req.session['tenant'] = tenantId;
      req.session['channel'] = channel;
      let redirect_url = req.query['redirect_url'] ?? '/';
      redirect_url = Buffer.from(JSON.stringify({ redirect_url: `${prefix}${redirect_url}` }), 'utf-8').toString(
        'base64',
      );
      passport.authenticate(
        strategy,
        {
          ...req['options'],
          failureRedirect: `${prefix}/login`,
          state: redirect_url,
        },
        (err, user, info) => {
          if (err || !user) {
            return next(err || info);
          }
          req.logIn(user, err => {
            if (err) {
              return next(err);
            }

            this.updateSessionDuration(req);
            let state = req.query['state'] as string;
            const buff = Buffer.from(state, 'base64').toString('utf-8');
            state = JSON.parse(buff);
            let url: string = state['redirect_url'];
            url = !url.startsWith('/') ? `/${url}` : url;
            return res.redirect(url);
          });
        },
      )(req, res, next);
    } catch (err) {
      res.status(HttpStatus.NOT_FOUND).send();
    }
  }

  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    const id_token = req.user ? req.user['id_token'] : undefined;
    req.logout();
    req.session.destroy(async () => {
      const end_session_endpoint =
        this.idpInfos[this.getIdpInfosKey(params.tenantId, params.channelType)].trustIssuer.metadata
          .end_session_endpoint;

      if (end_session_endpoint) {
        res.redirect(
          `${end_session_endpoint}?post_logout_redirect_uri=${
            this.options.redirectUriLogout ? this.options.redirectUriLogout : this.options.origin
          }&client_id=${this.options.clientMetadata.client_id}${id_token ? '&id_token_hint=' + id_token : ''}`,
        );
      } else {
        // Save logged out state for 15 min
        res.cookie(SESSION_STATE_COOKIE, 'logged out', {
          maxAge: 15 * 1000 * 60,
        });
        let prefix = params.tenantId && params.channelType ? `/${params.tenantId}/${params.channelType}` : '';
        let suffix =
          req.query.tenantId && req.query.channelType
            ? `?tenantId=${req.query.tenantId}&channelType=${req.query.channelType}`
            : '';
        res.redirect(`${prefix}/loggedout${suffix}`);
      }
    });
  }

  async refreshTokens(@Req() req: Request, @Res() res: Response, @Next() next: Function) {
    if (!req.isAuthenticated()) {
      res.sendStatus(401);
      return;
    }
    const authTokens = req.user['authTokens'];
    authTokens.channel = req.user['userinfo'].channel;
    if (this.isExpired(authTokens.expiresAt)) {
      authTokens.channel = req.user['userinfo'].channel;
      return await this.requestTokenRefresh(authTokens)
        .then(data => {
          this.updateUserAuthToken(data, req);
          this.updateSessionDuration(req);
          res.sendStatus(200);
        })
        .catch(err => {
          res.status(401).send(err);
        });
    } else {
      return res.sendStatus(200);
    }
  }

  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params?: any) {
    let prefix = this._getPrefix(req, params);
    let postLogoutRedirectUri = this.options.postLogoutRedirectUri || '/login';
    if (!postLogoutRedirectUri.startsWith('/')) {
      postLogoutRedirectUri = `/${postLogoutRedirectUri}`;
    }

    const msgPageOpts = {
      title: "You've been signed out",
      subtitle: `You will be redirected in a moment`,
      description: 'Be patient, the page will refresh itself, if not click on the following button.',
      svg: 'exit' as const,
      redirect: {
        auto: true,
        link: `${prefix}${postLogoutRedirectUri}`,
        label: 'Logout',
      },
    };
    const loggedOutPage = this.ssrPagesService.build(msgPageOpts);
    res.send(loggedOutPage);
  }

  async requestTokenRefresh(authToken: IdentityProviderOptions) {
    if (!authToken.accessToken || !authToken.refreshToken || !authToken.tokenEndpoint) {
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
          (response.data.expires_in ? Date.now() / 1000 + Number(response.data.expires_in) : null),
      };
    } else {
      throw new Error(response.data);
    }
  }

  updateSessionDuration(req) {
    if (req.session) {
      req.session.cookie.maxAge = req.user.authTokens.refreshExpiresIn * 1000;
    }
  }

  updateUserAuthToken(data: Partial<IdentityProviderOptions>, req) {
    req.user.authTokens.accessToken = data.accessToken;
    req.user.authTokens.refreshToken = data.refreshToken;
    req.user.authTokens.expiresAt = data.expiresAt;
  }

  _getPrefix(@Req() req: Request, params) {
    return req.query.tenantId && req.query.channelType
      ? `/${req.query.tenantId}/${req.query.channelType}`
      : params.tenantId && params.channelType
      ? `/${params.tenantId}/${params.channelType}`
      : '';
  }
}
