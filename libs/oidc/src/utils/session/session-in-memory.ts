import { INestApplication } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';
import { baseSession } from './base-session';

export function sessionInMemory(app: INestApplication, name: string) {
  app.use(
    session({
      name,
      ...baseSession,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
