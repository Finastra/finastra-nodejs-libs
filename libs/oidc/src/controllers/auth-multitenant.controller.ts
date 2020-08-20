import { Controller, Get, Req, Res, Param, Next } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';
import { isAvailableRouteForMultitenant } from '../decorators';

@Controller('/:tenantId/:channelType')
export class AuthMultitenantController {
  constructor(public oidcService: OidcService) {}

  @isAvailableRouteForMultitenant(true)
  @Get('/user')
  user(@Req() req) {
    return req.user.userinfo;
  }

  @Public()
  @isAvailableRouteForMultitenant(true)
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
  @isAvailableRouteForMultitenant(true)
  @Get('login/callback')
  loginCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: Function,
    @Param() params,
  ) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @isAvailableRouteForMultitenant(true)
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @isAvailableRouteForMultitenant(true)
  @Get('/check-token')
  async checkTokens(@Req() req: Request, @Res() res: Response) {
    this.oidcService.checkToken(req, res);
  }

  @isAvailableRouteForMultitenant(true)
  @Get('/refresh-token')
  refreshTokens(@Req() req, @Res() res) {
    this.oidcService.refreshTokens(req, res);
  }

  @Public()
  @isAvailableRouteForMultitenant(true)
  @Get('/loggedout')
  loggedOut(@Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(res, params);
  }
}
