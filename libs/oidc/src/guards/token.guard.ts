import {
  ExecutionContext,
  Injectable,
  CanActivate,
  Inject,
} from '@nestjs/common';
import { TOKEN_STORE } from '../oidc.constants';
import { ExtractJwt } from 'passport-jwt';
import { JWT, JWKS } from 'jose';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    @Inject(TOKEN_STORE) private tokenStore: JWKS.KeyStore,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
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
      return request.isAuthenticated();
    }
  }
}
