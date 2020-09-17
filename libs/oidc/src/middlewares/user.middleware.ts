import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ExtractJwt } from 'passport-jwt';
import { JWT } from 'jose';
import { getUserInfo, authenticateExternalIdps } from '../utils';
import { OidcService } from '../services';
import { ChannelType } from '../interfaces';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private service: OidcService) {}
  async use(req: Request, res: Response, next: Function) {
    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!jwt) throw 'No Jwt';

      const routeParams =
        req.params && req.params[0] && req.params[0].split('/');
      let tenantId, channelType;
      if (
        routeParams &&
        routeParams[1] &&
        (routeParams[1] === ChannelType.b2c ||
          routeParams[1] === ChannelType.b2e)
      ) {
        tenantId = routeParams[0];
        channelType = routeParams[1];
      }

      if (
        !this.service.tokenStores ||
        !this.service.tokenStores[
          this.service.getTokenStoreKey(tenantId, channelType)
        ]
      ) {
        await this.service.createStrategy(tenantId, channelType);
      }
      const tokenStore = this.service.tokenStores[
        this.service.getTokenStoreKey(tenantId, channelType)
      ];
      const decodedJwt = JWT.verify(jwt, tokenStore);

      req.user = decodedJwt;
      if (this.service.options.externalIdps) {
        req.user['authTokens'] = await authenticateExternalIdps(
          this.service.options.externalIdps,
        );
      }
      req.user['userinfo'] = await getUserInfo(jwt, this.service);
      req.user['userinfo'].channel = channelType;

      next();
    } catch (err) {
      next();
    }
  }
}
