import { Inject, Injectable, NestMiddleware, Next, Req, Res } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { ChannelType, OidcModuleOptions } from '../interfaces';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';
import { OidcService } from '../services';
import { authenticateExternalIdps, getUserInfo } from '../utils';

@Injectable()
export class UserMiddleware implements NestMiddleware {
  constructor(private service: OidcService, @Inject(OIDC_MODULE_OPTIONS) public options: OidcModuleOptions) { }
  async use(@Req() req, @Res() res, @Next() next) {
    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
      if (!jwt) {
        throw 'No Jwt';
      }

      const routeParams = req.params && req.params[0] && req.params[0].split('/');
      const fixedChannelType = this.service.options.channelType;
      let tenantId, channelType;
      if (routeParams && routeParams[1] && (routeParams[1] === ChannelType.b2c || routeParams[1] === ChannelType.b2e)) {
        tenantId = routeParams[0];
        channelType = routeParams[1];
      } else if (routeParams && (fixedChannelType === ChannelType.b2c || fixedChannelType === ChannelType.b2e)) {
        tenantId = routeParams[0];
        channelType = fixedChannelType;
      }

      const key = this.service.getIdpInfosKey(tenantId, channelType);

      if (!this.service.idpInfos.get(key)) {
        await this.service.createStrategyMultitenant(tenantId, channelType);
      }

      // const client = this.service.idpInfos.get(key).client
      // const jwks = await createRemoteJWKSet(new URL(client.issuer.metadata.jwks_uri));
      // const decodedJwt = await jwtVerify(jwt, jwks);

      // const decodedJwt = JWT.verify(jwt, this.service.idpInfos.get(key).tokenStore);

      // req.user = decodedJwt;
      if (this.service.options.externalIdps) {
        req.user['authTokens'] = await authenticateExternalIdps(this.service.options.externalIdps);
      }
      req.user['userinfo'] = await getUserInfo(jwt, this.options, this.service.idpInfos.get(key).client);
      req.user['userinfo'].channel = channelType;

      next();
    } catch (err) {
      next();
    }
  }
}
