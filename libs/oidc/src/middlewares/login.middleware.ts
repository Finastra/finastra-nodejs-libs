import { Injectable, NestMiddleware, Request, Res, Next } from '@nestjs/common';
import { SESSION_STATE_COOKIE } from '../oidc.constants';
import * as cookie from 'cookie';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  options = {};

  async use(@Request() req, @Res() res, @Next() next) {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
    const sessionState = cookies.SESSION_STATE;

    if (sessionState) {
      req.options = { prompt: 'login' };
      res.clearCookie(SESSION_STATE_COOKIE);
    } else {
      req.options = {};
    }
    next();
  }
}
