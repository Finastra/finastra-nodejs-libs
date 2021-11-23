import { baseSession as session } from './base-session';

describe('baseSession', () => {
  it('should be defined', () => {
    expect(session).toBeDefined();
  });
});

describe('baseSession in prod', () => {
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    process.env.NODE_ENV = 'production';
  });

  // it('should set cookie secure to true if production', () => {
  //   const { baseSession } = require('./base-session');
  //   expect(baseSession.cookie.secure).toBeTruthy();
  // });

  afterAll(() => {
    process.env = OLD_ENV;
  });
});
