import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { TOKEN_STORE } from '../oidc.constants';
import { ExtractJwt } from 'passport-jwt';
import { JWT, JWKS } from 'jose';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_STORE) private tokenStore: JWKS.KeyStore,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    let request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );

    if (isPublic) return true;

    try {
      const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
      const tokenStore = this.tokenStore;
      const valid = JWT.verify(jwt, tokenStore);
      return !!valid;
    } catch (err) {
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
}
