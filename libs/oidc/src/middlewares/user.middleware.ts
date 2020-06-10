import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { JWT } from 'jose';
import { getUserInfo, OidcHelpers, getTokenStore } from '../utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private oidcHelpers: OidcHelpers) {}
  async use(req: Request, res: Response, next: Function) {
    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!jwt) throw 'No Jwt';

      const tokenStore = this.oidcHelpers.tokenStore;
      const decodedJwt = JWT.verify(jwt, tokenStore);

      req.user = decodedJwt;
      req.user['userinfo'] = await getUserInfo(jwt, this.oidcHelpers);

      next();
    } catch (err) {
      next();
    }
  }
}
