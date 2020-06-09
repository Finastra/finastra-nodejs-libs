import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { JWT } from 'jose';
import { getUserInfo, OidcHelpers, getTokenStore } from '../utils';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(
    private oidcHelpers: OidcHelpers,
    private configService: ConfigService,
  ) {}
  async use(req: Request, res: Response, next: Function) {
    try {
      const issuer = this.configService.get('OIDC_ISSUER');
      const tokenStore = await getTokenStore(issuer);
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      const decodedJwt = JWT.verify(jwt, tokenStore);
      req.user = decodedJwt;
      req.user['userinfo'] = getUserInfo(jwt, this.oidcHelpers);
      next();
    } catch (err) {
      next();
    }
  }
}
