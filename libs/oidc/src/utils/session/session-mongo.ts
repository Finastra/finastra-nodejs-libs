const MongoStore = require('connect-mongo');
import { INestApplication } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';
import { baseSession } from './base-session';

export const sessionMongo = (app: INestApplication, name: string, options: ConnectMongoOptions) => {
  app.use(
    session({
      name,
      ...baseSession,
      store: MongoStore.create(options),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
};

export interface ConnectMongoOptions {
  mongoUrl?: string;
  collectionName?: string;
  dbName?: string;
  ttl?: number;
  [key: string]: any;
}
