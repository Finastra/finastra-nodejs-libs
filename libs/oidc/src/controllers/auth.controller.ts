import { Controller, Get, Req, Res, Param, Next } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
import { isAvailableRouteForMultitenant } from '../decorators';

@isAvailableRouteForMultitenant(false)
@Controller()
export class AuthController {
  constructor(public oidcService: OidcService) {}

  @Get('/user')
  user(@Req() req) {
    return req.user.userinfo;
  }

  @Public()
  @Get('/login')
  login(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @Get('/login/callback')
  loginCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @Get('/refresh-token')
  refreshTokens(@Req() req, @Res() res, @Next() next: Function) {
    this.oidcService.refreshTokens(req, res, next);
  }

  @Public()
  @Get('/loggedout')
  loggedOut(@Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(res, params);
  }
}
