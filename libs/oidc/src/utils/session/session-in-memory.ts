import { INestApplication } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';
import { baseSession } from './base-session';
const MemoryStore = require('memorystore')(session);

export function sessionInMemory(app: INestApplication, name: string) {
  app.use(
    session({
      name,
      ...baseSession,
      store: new MemoryStore({
        checkPeriod: 30 * 60 * 1000,
        stale: true,
      }),
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
