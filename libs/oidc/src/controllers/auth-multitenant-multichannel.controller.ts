import { Controller, Get, Next, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { isAvailableRouteForMultitenant } from '../decorators';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';

@isAvailableRouteForMultitenant(true)
@Controller('/:tenantId/:channelType')
export class AuthMultitenantMultiChannelController {
  constructor(public oidcService: OidcService) {}

  @Get('/user')
  user(@Req() req) {
    return req.user.userinfo;
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
  async refreshTokens(@Req() req: Request, @Res() res: Response, @Next() next: Function) {
    this.oidcService.refreshTokens(req, res, next);
  }

  @Public()
  @Get('/loggedout')
  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(req, res, params);
  }
}
