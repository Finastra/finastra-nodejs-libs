import { INestApplication } from '@nestjs/common';
import * as session from 'express-session';
import passport from 'passport';
import { baseSession } from './base-session';

export function sessionInMemory(app: INestApplication, name: string) {
  app.use(
    session.default({
      name,
      ...baseSession,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
