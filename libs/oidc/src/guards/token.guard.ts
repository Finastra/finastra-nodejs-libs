import { ExecutionContext, Injectable, CanActivate, Inject, UnauthorizedException } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

    if (isPublic) return true;
    if (context['contextType'] === 'graphql') {
      request = GqlExecutionContext.create(context).getContext().req;
    }
    if (request.isAuthenticated()) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
