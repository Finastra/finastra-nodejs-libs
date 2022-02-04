import { Injectable, NestMiddleware, Next, Request, Res } from '@nestjs/common';
import * as cookie from 'cookie';
import { LOGIN_SESSION_COOKIE, SESSION_STATE_COOKIE } from '../oidc.constants';

@Injectable()
export class LoginMiddleware implements NestMiddleware {
  async use(@Request() req, @Res() res, @Next() next) {
    const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};

    const sessionCookieLabel = cookies[SESSION_STATE_COOKIE]
      ? SESSION_STATE_COOKIE
      : cookies[LOGIN_SESSION_COOKIE]
      ? LOGIN_SESSION_COOKIE
      : null;
    if (sessionCookieLabel) {
      req.options = { prompt: 'login' };
      res.clearCookie(sessionCookieLabel);
    } else {
      req.options = {};
    }
    next();
  }
}
