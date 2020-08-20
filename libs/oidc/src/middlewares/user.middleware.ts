import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { JWT } from 'jose';
import { getUserInfo, authenticateExternalIdps } from '../utils';
import { OidcHelpersService } from '../services';
import { ChannelType } from '../interfaces';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private service: OidcHelpersService) {}
  async use(req: Request, res: Response, next: Function) {
    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!jwt) throw 'No Jwt';

      const tokenStore = this.service.oidcHelpers.tokenStore;
      const decodedJwt = JWT.verify(jwt, tokenStore);

      req.user = decodedJwt;
      if (this.service.oidcHelpers.config.externalIdps) {
        req.user['authTokens'] = await authenticateExternalIdps(
          this.service.oidcHelpers,
        );
      }
      req.user['userinfo'] = await getUserInfo(jwt, this.service.oidcHelpers);

      // Get channel
      const routeParams = req.params[0];
      if (routeParams[1] === (ChannelType.b2c || ChannelType.b2e)) {
        req.user['userinfo'].channel = routeParams[1];
      }

      next();
    } catch (err) {
      next();
    }
  }
}
