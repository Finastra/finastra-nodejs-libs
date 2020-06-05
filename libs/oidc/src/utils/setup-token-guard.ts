import { getTokenStore } from './oidc-helpers.util';
import { Reflector } from '@nestjs/core';
import { OidcConfigService } from 'src/configs/oidc-config.service';
import { TokenGuard } from '../guards';
import { ConfigService } from '@nestjs/config';

export async function getTokenGuard(app) {
  const configService = app.get(ConfigService);
  const issuer = configService.get('OIDC_ISSUER');
  const tokenStore = await getTokenStore(issuer);
  const reflector = app.get(Reflector);
  const oidcConfigService = new OidcConfigService(configService);
  return new TokenGuard(
    tokenStore,
    reflector,
    oidcConfigService.createModuleConfig(),
  );
}
