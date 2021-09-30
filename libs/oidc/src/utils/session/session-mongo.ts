import MongoStore from 'connect-mongo';
import { ConnectMongoOptions } from 'connect-mongo/build/main/lib/MongoStore';
import session from 'express-session';
import passport from 'passport';
import { baseSession } from './base-session';

export const sessionMongo = (app, name, options: ConnectMongoOptions) => {
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
