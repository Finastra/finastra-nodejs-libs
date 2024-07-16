import { Controller, Get, Header, Next, Param, Req, Res, UseGuards } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { UserinfoResponse } from 'openid-client';
import { isAvailableRouteForMultitenant } from '../decorators';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { LoginGuard } from '../guards/login.guard';
import { UserInfo } from '../interfaces';
import { OidcService } from '../services';

@Public()
@isAvailableRouteForMultitenant(false)
@Controller()
export class AuthController {
  constructor(public oidcService: OidcService) { }

  @Get('/user')
  @Header('Cache-Control', 'no-store, max-age=0')
  user(@CurrentUser() user: Express.User): UserInfo | UserinfoResponse {
    return user ? user['userinfo'] : { isGuest: true };
  }

  @Get('/login')
  @UseGuards(LoginGuard)
  @Header('Cache-Control', 'no-store, max-age=0')
  login(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction, @Param() params) {
    // this.oidcService.login(req, res, next, params);
  }

  @Get('/login/callback')
  @Public()
  @UseGuards(LoginGuard)
  loginCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction, @Param() params: any) {
    this.oidcService.loginCallback(req, res, next, params);
  }

  @Get('/logout')
  @Header('Cache-Control', 'no-store, max-age=0')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @Get('/refresh-token')
  @Header('Cache-Control', 'no-store, max-age=0')
  refreshTokens(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    this.oidcService.refreshTokens(req, res, next);
  }

  @Get('/loggedout')
  @Header('Cache-Control', 'no-store, max-age=0')
  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(req, res, params);
  }
}
