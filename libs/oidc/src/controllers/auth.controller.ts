import { Controller, Get, Req, Res, Param, Next } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
import { isAvailableRouteForMultitenant } from '../decorators';
import { UserInfo } from '../interfaces';
import { UserinfoResponse } from 'openid-client';

@isAvailableRouteForMultitenant(false)
@Controller()
export class AuthController {
  constructor(public oidcService: OidcService) {}

  @Public()
  @Get('/user')
  user(@Req() req: Request): UserInfo | UserinfoResponse {
    if (req.isAuthenticated()) {
      return req.user['userinfo'];
    }

    return {
      isGuest: true,
    };
  }

  @Public()
  @Get('/login')
  login(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @Get('/login/callback')
  loginCallback(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @Get('/refresh-token')
  refreshTokens(@Req() req: Request, @Res() res, @Next() next: Function) {
    this.oidcService.refreshTokens(req, res, next);
  }

  @Public()
  @Get('/loggedout')
  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(req, res, params);
  }
}
