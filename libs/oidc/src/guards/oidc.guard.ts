import { ExecutionContext, Injectable } from '@nestjs/common';
import { SESSION_STATE_COOKIE } from '../oidc.constants';
import * as cookie from 'cookie';

@Injectable()
export class OIDCGuard {
  options = {};

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const cookies = request.headers.cookie
      ? cookie.parse(request.headers.cookie)
      : {};
    const sessionState = cookies.SESSION_STATE;

    if (sessionState) {
      this.options = { prompt: 'login' };
      res.clearCookie(SESSION_STATE_COOKIE);
    } else {
      this.options = {};
    }

    return true;
  }
}
