import {
  Controller,
  Get,
  Request,
  Res,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { Response } from 'express';

import { OIDCGuard } from '../guards/oidc.guard';
import { Issuer } from 'openid-client';
import { OIDC_MODULE_OPTIONS, SESSION_STATE_COOKIE } from '../oidc.constants';
import { OidcModuleOptions } from '../interfaces/oidc-module-options.interface';
import { Public } from '../decorators/public.decorator';
import { join } from 'path';

@Controller()
export class AuthController {
  constructor(
    @Inject(OIDC_MODULE_OPTIONS) private options: OidcModuleOptions,
  ) {}

  @Public()
  @UseGuards(OIDCGuard)
  @Get('/login')
  login() {}

  @Public()
  @UseGuards(OIDCGuard)
  @Get('login/callback')
  loginCallback(@Request() req, @Res() res: Response) {
    res.redirect('/');
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
      const TrustIssuer = await Issuer.discover(this.options.issuer);
      const end_session_endpoint = TrustIssuer.metadata.end_session_endpoint;
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
}
