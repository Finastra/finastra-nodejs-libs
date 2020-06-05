import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TokenGuard, setupSession, getTokenStore } from '@ffdc/nestjs-oidc';
import { ConfigService } from '@nestjs/config';
import { OidcConfigService } from './configs/oidc-config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const issuer = configService.get('OIDC_ISSUER');
  const tokenStore = await getTokenStore(issuer);
  const reflector = app.get(Reflector);
  const oidcConfigService = new OidcConfigService(configService);
  app.useGlobalGuards(
    new TokenGuard(
      tokenStore,
      reflector,
      oidcConfigService.createModuleConfig(),
    ),
  );

  setupSession(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
