import { JWKS, JWT } from 'jose';
import { UserMiddleware } from './user.middleware';
import { OidcHelpers } from '../utils';
import { createMock } from '@golevelup/nestjs-testing';
import { Request, Response } from 'express';
import {
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_TRUST_ISSUER,
} from '../mocks';
import { TestingModule, Test } from '@nestjs/testing';
const utils = require('../utils');

describe('User Middleware', () => {
  let middleware: UserMiddleware;
  const keyStore = new JWKS.KeyStore([]);
  const MockOidcHelpers = new OidcHelpers(
    keyStore,
    MOCK_CLIENT_INSTANCE,
    MOCK_OIDC_MODULE_OPTIONS,
    MOCK_TRUST_ISSUER,
  );

  describe('config with external idp', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserMiddleware,
          {
            provide: OidcHelpers,
            useValue: MockOidcHelpers,
          },
        ],
      }).compile();

      middleware = module.get<UserMiddleware>(UserMiddleware);
    });

    it('should not do anything if no bearer', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      const next = jest.fn();
      middleware.use(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should add user in request', async () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      const next = jest.fn();
      jest.spyOn(JWT, 'verify').mockReturnValue({
        username: 'John Doe',
      } as any);

      utils.authenticateExternalIdps = jest
        .fn()
        .mockReturnValue(MockOidcHelpers.config.externalIdps);

      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
      req.headers.authorization = `Bearer ${token}`;

      await middleware.use(req, res, next);
      expect(req.user['authTokens']).toBe(MockOidcHelpers.config.externalIdps);
      expect(req.user['userinfo']).toBeTruthy();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('no external idp', () => {
    const moduleOptions = { ...MOCK_OIDC_MODULE_OPTIONS };
    delete moduleOptions.externalIdps;
    const MockOidcHelpersWithoutExtIdp = new OidcHelpers(
      keyStore,
      MOCK_CLIENT_INSTANCE,
      moduleOptions,
      MOCK_TRUST_ISSUER,
    );

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          UserMiddleware,
          {
            provide: OidcHelpers,
            useValue: MockOidcHelpersWithoutExtIdp,
          },
        ],
      }).compile();
      middleware = module.get<UserMiddleware>(UserMiddleware);
    });

    it('should add user in request', async () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      const next = jest.fn();
      jest.spyOn(JWT, 'verify').mockReturnValue({
        username: 'John Doe',
      } as any);
      const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`;
      req.headers.authorization = `Bearer ${token}`;
      await middleware.use(req, res, next);
      expect(req.user['userinfo']).toBeTruthy();
      expect(next).toHaveBeenCalled();
    });
  });
});
