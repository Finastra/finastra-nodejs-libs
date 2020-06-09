import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSession, TokenGuard } from '@ffdc/nestjs-oidc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new TokenGuard(reflector));
  setupSession(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
