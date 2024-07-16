// import { Controller, Get, Next, Param, Req, Res } from '@nestjs/common';
// import { Request, Response } from 'express';
// import { Public } from '../decorators/public.decorator';
// import { OidcService } from '../services';

// @Controller('/login/callback')
// export class LoginCallbackController {
//   constructor(public oidcService: OidcService) {}

//   @Public()
//   @Get()
//   loginCallback(@Req() req: Request, @Res() res: Response, @Next() next: Function, @Param() params) {
//     this.oidcService.login(req, res, next, params);
//   }
// }
