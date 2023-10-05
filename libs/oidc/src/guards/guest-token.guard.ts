import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { OidcService } from '../services';
import { hasDecorator } from '../utils/has-decorator';

@Injectable()
export class GuestTokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private oidcService: OidcService) {}
  async canActivate(context: ExecutionContext) {
    let request;
    if (context['contextType'] === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }
    const params = request.params;
    const isPublic = hasDecorator('isPublic', context, this.reflector);

    if (isPublic) return true;

    const prefix = params && params.tenantId && params.channelType ? `/${params.tenantId}/${params.channelType}` : '';

    if (request.isAuthenticated()) {
      if (this.oidcService.isExpired(request.user['authTokens'].expiresAt)) {
        await this.oidcService
          .requestTokenRefresh(request.user['authTokens'])
          .then(data => {
            this.oidcService.updateUserAuthToken(data, request);
            this.oidcService.updateSessionDuration(request);
          })
          .catch(err => {
            throw new UnauthorizedException();
          });
      }
      return true;
    } else {
      return true;
    }
  }
}
