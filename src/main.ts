import { HttpLoggingInterceptor, OMSLogger } from '@finastra/nestjs-logger';
import { setupSession, TokenGuard } from '@finastra/nestjs-oidc';
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

  setupSession(app, 'test-app');

  /* If you're using MongoDB, you can use the following code to configure the session store.
  sessionMongo(app, 'test-app', {
    mongoUrl: 'mongodb://user:password@localhost:27017',
    dbName: 'sample-db',
  });*/

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    Logger.log('Listening at ' + process.env.ORIGIN, 'main');
  });
}
bootstrap();
