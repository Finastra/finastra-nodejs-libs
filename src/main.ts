import { OMSLogger } from '@ffdc/logger';
import { HttpLoggingInterceptor } from '@ffdc/logger/interceptors/common-http.interceptor';
import { setupSession, TokenGuard } from '@ffdc/nestjs-oidc';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const omsLogger = new OMSLogger();
  const app = await NestFactory.create(AppModule, {
    logger: omsLogger,
  });
  app.useLogger(omsLogger);
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  app.useGlobalGuards(app.get(TokenGuard));

  setupSession(app, 'test-app');

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
