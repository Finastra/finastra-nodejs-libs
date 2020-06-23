import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { JWT } from 'jose';
import { getUserInfo, OidcHelpers, authenticateExternalIdps } from '../utils';

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
      if (this.oidcHelpers.config.externalIdps) {
        req.user['externalIdps'] = await authenticateExternalIdps(
          this.oidcHelpers,
        );
      }
      req.user['userinfo'] = await getUserInfo(jwt, this.oidcHelpers);

      next();
    } catch (err) {
      next();
    }
  }
}
