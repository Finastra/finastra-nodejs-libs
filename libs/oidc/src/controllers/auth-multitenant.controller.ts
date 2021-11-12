import { Controller, Get, Header, Next, Param, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserinfoResponse } from 'openid-client';
import { isAvailableRouteForMultitenant } from '../decorators';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { UserInfo } from '../interfaces';
import { OidcService } from '../services';

@Public()
@isAvailableRouteForMultitenant(true)
@Controller('/:tenantId/:channelType')
export class AuthMultitenantController {
  constructor(public oidcService: OidcService) {}

  @Get('/user')
  @Header('Cache-Control', 'no-store, max-age=0')
  user(@CurrentUser() user: Express.User): UserInfo | UserinfoResponse {
    return user ? user['userinfo'] : { isGuest: true };
  }

  @Get('/login')
  @Header('Cache-Control', 'no-store, max-age=0')
  login(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    this.oidcService.login(req, res, next, params);
  }

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

  @Get('/loggedout')
  @Header('Cache-Control', 'no-store, max-age=0')
  loggedOut(@Req() req: Request, @Res() res: Response, @Param() params) {
    this.oidcService.loggedOut(req, res, params);
  }
}
