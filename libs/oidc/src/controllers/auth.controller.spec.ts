import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';
import { createResponse, createRequest } from 'node-mocks-http';
import { OidcModuleOptions } from '../interfaces';
import { JWKS } from 'jose';
import {
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_CLIENT_INSTANCE,
  MOCK_TRUST_ISSUER,
} from '../mocks';
import { OidcHelpers } from '../utils';
import axios from 'axios';

const keyStore = new JWKS.KeyStore([]);
const MockOidcHelpers = new OidcHelpers(
  keyStore,
  MOCK_CLIENT_INSTANCE,
  MOCK_OIDC_MODULE_OPTIONS,
  MOCK_TRUST_ISSUER,
);

describe('AuthController', () => {
  let controller: AuthController;
  let options: OidcModuleOptions;
  let oidcHelpers: OidcHelpers;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: OIDC_MODULE_OPTIONS,
          useValue: MOCK_OIDC_MODULE_OPTIONS,
        },
        {
          provide: OidcHelpers,
          useValue: MockOidcHelpers,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    options = module.get<OidcModuleOptions>(OIDC_MODULE_OPTIONS);
    oidcHelpers = module.get<OidcHelpers>(OidcHelpers);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should not return anything', () => {
      expect(controller.login()).toBeUndefined();
    });
  });

  describe('loginCallback', () => {
    it('should call redirect', () => {
      const res = createResponse();
      const spy = jest.spyOn(res, 'redirect');
      controller.loginCallback(null, res);
      expect(spy).toHaveBeenCalledWith('/');
    });
  });

  describe('user', () => {
    it('should return userinfo', () => {
      const req = createRequest();
      const userinfo = { username: 'test-user' };
      req.user = {
        userinfo,
      };
      expect(controller.user(req)).toBe(userinfo);
    });
  });

  describe('logout', () => {
    let req;
    let res;
    let spyLogout;
    let spyResponse;

    beforeEach(() => {
      req = createRequest();
      req.logout = jest.fn();
      res = createResponse();
      spyLogout = jest.spyOn(req, 'logout');
      spyResponse = jest.spyOn(res, 'redirect');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call logout', () => {
      (req.session as any) = {
        destroy: cb => {
          cb(null);
        },
      };

      controller.logout(req, res);
      expect(spyLogout).toHaveBeenCalled();
    });

    it('should redirect without id_token_hint', done => {
      req.user = {};
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(
              expect.not.stringContaining('id_token_hint'),
            );
            done();
          });
        }),
      };
      controller.logout(req, res);
    });

    it('should redirect with id_token_hint', done => {
      req.user = {
        id_token: '123',
      };
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(
              expect.stringContaining('id_token_hint'),
            );
            done();
          });
        }),
      };
      controller.logout(req, res);
    });

    it('should redirect on redirectUriLogout if set', done => {
      req.user = {
        id_token: '123',
      };
      const mockRedirectLogout = 'other-website';
      options.redirectUriLogout = mockRedirectLogout;
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(
              expect.stringContaining(mockRedirectLogout),
            );
            done();
          });
        }),
      };
      controller.logout(req, res);
    });

    it('should redirect on root if no end_session_endpoint found', done => {
      oidcHelpers.TrustIssuer.metadata.end_session_endpoint = null;

      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith('/loggedout');
            done();
          });
        }),
      };
      controller.logout(req, res);
    });
  });

  describe('loggedout', () => {
    it('should call sendFile', () => {
      const res = createResponse();
      res.sendFile = jest.fn();
      const spy = jest.spyOn(res, 'sendFile');
      controller.loggedout(res);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('checkTokens', () => {
    it('should return 200 if token is valid', () => {
      const req = createRequest();
      req.user = {
        authTokens: {},
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');

      controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 401 if token is expired', () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000,
          },
        },
      };
      const res = createResponse();
      res.status = jest.fn();
      const spy = jest.spyOn(res, 'status');

      controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(401);
    });

    it('should return 200 if valid token was refreshed via explicit query param', async () => {
      options.defaultHttpOptions = {
        timeout: 0,
      };
      const req = createRequest();
      req.query = {
        refresh: 'true',
      };
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000 + 25,
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {},
        }),
      );

      await controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 401 if valid token failed to refresh via explicit query param', async () => {
      const req = createRequest();
      req.query = {
        refresh: 'true',
      };
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000 + 25,
          },
        },
      };
      const res = createResponse();
      res.status = (() => {
        return { send: jest.fn() };
      }) as any;
      const spy = jest.spyOn(res, 'status');

      await controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(401);
    });

    it('should return 401 if valid token was refreshed via explicit query param but refresh failed', async () => {
      const req = createRequest();
      req.query = {
        refresh: 'true',
      };
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000 + 25,
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.status = (() => {
        return { send: jest.fn() };
      }) as any;
      const spy = jest.spyOn(res, 'status');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 401,
          data: {},
        }),
      );

      await controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(401);
    });

    it('should return 200 if valid token was refreshed via explicit query param and res has expiresAt', async () => {
      const req = createRequest();
      req.query = {
        refresh: 'true',
      };
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000 + 25,
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_at: Date.now() / 1000 + 1000,
          },
        }),
      );

      await controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if valid token was refreshed via explicit query param and res has expires_in', async () => {
      const req = createRequest();
      req.query = {
        refresh: 'true',
      };
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000 + 25,
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_in: 300,
          },
        }),
      );

      await controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if valid token was not refreshed via explicit query param because less than idle time', async () => {
      const req = createRequest();
      req.query = {
        refresh: 'true',
      };
      req.user = {
        authTokens: {
          testToken: {
            expiresAt: Date.now() / 1000 + 500,
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');

      await controller.checkTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });
  });

  describe('refreshTokens', () => {
    it('should return 200 if no token to refresh', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {},
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');

      await controller.refreshTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if token was refreshed', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          testToken: {
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_in: 300,
          },
        }),
      );

      await controller.refreshTokens(req, res);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 401 if token failed to refresh', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          testToken: {
            accessToken: 'abc',
            refreshToken: 'def',
            tokenEndpoint: '/token',
          },
        },
      };
      const res = createResponse();
      res.status = (() => {
        return { send: jest.fn() };
      }) as any;
      const spy = jest.spyOn(res, 'status');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 401,
          data: {},
        }),
      );

      await controller.refreshTokens(req, res);
      expect(spy).toHaveBeenCalledWith(401);
    });
  });
});
