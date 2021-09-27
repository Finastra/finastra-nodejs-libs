import { sessionInMemory } from './session/session-in-memory';

export const setupSession = (app, name) => {
  return sessionInMemory(app, name);
};
