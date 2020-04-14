import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TokenGuard, setupSession, getTokenStore } from '@uxd-finastra/oidc';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const issuer = app.get(ConfigService).get('OIDC_ISSUER');
  const tokenStore = await getTokenStore(issuer);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new TokenGuard(tokenStore, reflector));

  setupSession(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
