import { HttpLoggingInterceptor, OMSLogger } from '@finastra/nestjs-logger';
import { sessionMongo, TokenGuard } from '@finastra/nestjs-oidc';
import { Logger } from '@nestjs/common';
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

  sessionMongo(app, 'test-app', {
    mongoUrl: 'mongodb://user:password@localhost:27017',
    dbName: 'ux-hub',
  });

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    Logger.log('Listening at ' + process.env.ORIGIN, 'main');
  });
}
bootstrap();
