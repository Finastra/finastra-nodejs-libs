import { Controller, Get, Next, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserinfoResponse } from 'openid-client';
import { isAvailableRouteForMultitenant } from '../decorators';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { UserInfo } from '../interfaces';
import { OidcService } from '../services';

@isAvailableRouteForMultitenant(false)
@Controller()
export class AuthController {
  constructor(public oidcService: OidcService) {}

  @Public()
  @Get('/user')
  user(@CurrentUser() user: Express.User): UserInfo | UserinfoResponse {
    return user ? user['userinfo'] : { isGuest: true };
  }

  @Public()
  @Get('/login')
  login(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @Get('/refresh-token')
  refreshTokens(@Req() req: Request, @Res() res: Response, @Next() next: Function) {
    this.oidcService.refreshTokens(req, res, next);
  }

  @Public()
  @Get('/loggedout')
  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(req, res, params);
  }
}
