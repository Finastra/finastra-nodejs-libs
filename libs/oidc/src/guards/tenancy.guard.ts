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
      context.getHandler(),
    );
    if (
      typeof isMultitenant === 'undefined' ||
      isMultitenant === this.oidcService.isMultitenant
    ) {
      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
