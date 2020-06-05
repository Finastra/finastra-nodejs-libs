import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupSession, getTokenGuard } from '@ffdc/nestjs-oidc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalGuards(await getTokenGuard(app));

  setupSession(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
