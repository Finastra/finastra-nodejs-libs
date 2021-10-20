import { Controller, Get, Next, Param, Req, Res, Header } from '@nestjs/common';
import { Request, Response } from 'express';
import { isAvailableRouteForMultitenant } from '../decorators';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';

@isAvailableRouteForMultitenant(true)
@Controller('/:tenantId/:channelType')
export class AuthMultitenantController {
  constructor(public oidcService: OidcService) {}

  @Get('/user')
  @Header('Cache-Control', 'no-store, max-age=0')
  user(@Req() req) {
    return req.user.userinfo;
  }

  @Public()
  @Get('/login')
  @Header('Cache-Control', 'no-store, max-age=0')
  login(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    this.oidcService.login(req, res, next, params);
  }

  @Public()
  @Get('/logout')
  @Header('Cache-Control', 'no-store, max-age=0')
  async logout(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.logout(req, res, params);
  }

  @Get('/refresh-token')
  @Header('Cache-Control', 'no-store, max-age=0')
  async refreshTokens(@Req() req: Request, @Res() res: Response, @Next() next: Function) {
    this.oidcService.refreshTokens(req, res, next);
  }

  @Public()
  @Get('/loggedout')
  @Header('Cache-Control', 'no-store, max-age=0')
  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(req, res, params);
  }
}
