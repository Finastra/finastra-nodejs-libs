import { HttpLoggingInterceptor, OMSLogger } from '@finastra/nestjs-logger';
import { setupSession, TokenGuard } from '@finastra/nestjs-oidc';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { readFileSync } from 'fs';
import { AppModule } from './app.module';
// import { HttpExceptionGlobalFilter } from './filters/http-exception-global.filter';

async function bootstrap() {
  const logger = new OMSLogger();

  let httpsOptions = null;
  if (process.env.HTTPS && process.env.HTTPS === 'true') {
    httpsOptions = {
      key: readFileSync('./envs/certificates/localhost.key'),
      cert: readFileSync('./envs/certificates/localhost.crt'),
    };
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger,
    httpsOptions,
  });
  app.useLogger(logger);
  app.useGlobalInterceptors(new HttpLoggingInterceptor());
  // app.useGlobalFilters(new HttpExceptionGlobalFilter());

  app.useGlobalGuards(app.get(TokenGuard));

  setupSession(app, 'test-app');

  /* If you're using MongoDB, you can use the following code to configure the session store.
  sessionMongo(app, 'test-app', {
    mongoUrl: 'mongodb://user:password@localhost:27017',
    dbName: 'sample-db',
  });*/

  const port = process.env.PORT || 3000;

  await app.listen(port, async () => {
    Logger.log(`✅ Application is running on: ${await app.getUrl()}`, 'Bootstrap');
  });
}
bootstrap();
