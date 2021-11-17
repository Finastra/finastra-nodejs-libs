import { HttpLoggingInterceptor, OMSLogger } from '@finastra/nestjs-logger';
import { setupSession, TokenGuard } from '@finastra/nestjs-oidc';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new OMSLogger();

  let httpsOptions = null;
  if (process.env.HTTPS && process.env.HTTPS === 'true') {
    httpsOptions = {
      key: readFileSync('./envs/certificates/localhost.key'),
      cert: readFileSync('./envs/certificates/localhost.crt'),
    };
  }

  const app = await NestFactory.create(AppModule, {
    logger,
    httpsOptions,
  });
  app.useLogger(logger);
  app.useGlobalInterceptors(new HttpLoggingInterceptor());

  app.useGlobalGuards(app.get(TokenGuard));

  setupSession(app, 'test-app');

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    Logger.log('Listening at ' + process.env.ORIGIN, 'main');
  });
}
bootstrap();
