import { Controller, Get, Next, Param, Req, Res, UseGuards } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Public } from '../decorators/public.decorator';
import { LoginGuard } from '../guards/login.guard';
import { OidcService } from '../services';

@Controller('/login/callback')
export class LoginCallbackController {
  constructor(public oidcService: OidcService) { }

  @Get()
  @Public()
  @UseGuards(LoginGuard)
  loginCallback(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction, @Param() params: any) {
    this.oidcService.loginCallback(req, res, next, params);
  }
}
