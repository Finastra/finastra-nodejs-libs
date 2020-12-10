import { Controller, Get, Req, Res, Param, Next } from '@nestjs/common';
import { Response, Request } from 'express';
import { Public } from '../decorators/public.decorator';
import { OidcService } from '../services';

@Controller('/login/callback')
export class LoginCallbackController {
  constructor(public oidcService: OidcService) {}

  @Public()
  @Get()
  loginCallback(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
    this.oidcService.login(req, res, next, params);
  }
}
