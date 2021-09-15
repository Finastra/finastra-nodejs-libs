import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { OidcService } from '../services';


@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private oidcService: OidcService) { }
  async canActivate(context: ExecutionContext) {
    let request;
    let prefix = "";
    if (context['contextType'] === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }
    const params = request.params;
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    
    if (isPublic) return true;

    if (params) {
       prefix = params.tenantId && params.channelType ? `/${params.tenantId}/${params.channelType}` : '';
    }

    if (request.isAuthenticated() && (!this.oidcService.isExpired(request.user['authTokens'].expiresAt) || (request.url === `${prefix}/refresh-token`))) {
        return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
