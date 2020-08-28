import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OidcService } from '../services';

@Injectable()
export class TenancyGuard implements CanActivate {
  constructor(private reflector: Reflector, private oidcService: OidcService) {}

  canActivate(context: ExecutionContext): boolean {
    const isMultitenant = this.reflector.get<boolean>(
      'isMultitenant',
      context.getClass(),
    );
    const req = context.switchToHttp().getRequest();
    if (
      (typeof isMultitenant === 'undefined' ||
        isMultitenant === this.oidcService.isMultitenant) &&
      (!req.user ||
        !req.user.userinfo.channel ||
        (req.user.userinfo.channel &&
          req.user.userinfo.tenant &&
          req.user.userinfo.tenant === req.params.tenantId &&
          req.user.userinfo.channel === req.params.channelType))
    ) {
      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
