import * as session from 'express-session';
import * as passport from 'passport';
import { v4 as uiid } from 'uuid';

export function setupSession(app, name) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || uiid(), // to sign session id
      resave: false, // will default to false in near future: https://github.com/expressjs/session#resave
      saveUninitialized: false, // will default to false in near future: https://github.com/expressjs/session#saveuninitialized
      rolling: true, // keep session alive
      cookie: {
        maxAge: 30 * 60 * 1000, // session expires in 1hr, refreshed by `rolling: true` option.
        httpOnly: true, // so that cookie can't be accessed via client-side script
        secure: false,
      },
      name,
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());
}
