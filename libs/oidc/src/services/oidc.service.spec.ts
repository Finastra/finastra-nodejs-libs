import axios from 'axios';
import { JWKS } from 'jose';
import { createRequest, createResponse } from 'node-mocks-http';
import { Issuer } from 'openid-client';
import { ChannelType, OidcModuleOptions } from '../interfaces';
import { MOCK_CLIENT_INSTANCE, MOCK_ISSUER_INSTANCE, MOCK_OIDC_MODULE_OPTIONS, MOCK_TRUST_ISSUER } from '../mocks';
import { OidcStrategy } from '../strategies';
import { OidcService } from './oidc.service';
import passport = require('passport');

describe('OidcService', () => {
  let service = new OidcService(MOCK_OIDC_MODULE_OPTIONS);
  let options: OidcModuleOptions = MOCK_OIDC_MODULE_OPTIONS;
  const idpKey = 'idpKey';

  describe('createStrategy', () => {
    beforeEach(async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest.spyOn(Issuer, 'discover').mockImplementation(() => Promise.resolve(IssuerMock));
    });
    it('should create strategy when app is single tenant', async () => {
      let strategy = await service.createStrategy();
      expect(strategy).toBeDefined();
    });

    it('should create strategy when app is single tenant with nonce = true', async () => {
      service.options.authParams.nonce = 'true';
      let strategy = await service.createStrategy();
      expect(strategy).toBeDefined();
    });

    it('should create strategy when app is single tenant without defaultHttpOptions', async () => {
      delete service.options.defaultHttpOptions;
      let strategy = await service.createStrategy();
      expect(strategy).toBeDefined();
    });

    it('should create strategy with b2c channel when app is multitenant', async () => {
      delete service.options.issuer;
      service.options.issuerOrigin = 'http://issuer.io';
      service.options['b2c'] = {
        clientMetadata: MOCK_OIDC_MODULE_OPTIONS.clientMetadata,
      };

      let strategy = await service.createStrategy('tenant', ChannelType.b2c);
      expect(strategy).toBeDefined();
    });

    it('should create strategy with b2e channel when app is multitenant', async () => {
      delete service.options.issuer;
      service.options.issuerOrigin = 'http://issuer.io';
      service.options['b2e'] = {
        clientMetadata: MOCK_OIDC_MODULE_OPTIONS.clientMetadata,
      };
      let strategy = await service.createStrategy('tenant', ChannelType.b2e);
      expect(strategy).toBeDefined();
    });

    it('should terminate process on error fetching issuer for single tenant app', async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest.spyOn(Issuer, 'discover').mockImplementation(() => Promise.reject());

      let mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number): never => {
        return undefined as never;
      });
      service.isMultitenant = false;
      await service.createStrategy('tenant', ChannelType.b2c);
      expect(mockExit).toHaveBeenCalled();
    });

    it('should throw on error fetching issuer for multitenant app', async () => {
      const IssuerMock = MOCK_ISSUER_INSTANCE;
      IssuerMock.keystore = jest.fn();
      jest.spyOn(Issuer, 'discover').mockImplementation(() => Promise.reject());
      service.isMultitenant = true;
      await expect(service.createStrategy('tenant', ChannelType.b2c)).rejects.toThrow();
    });
  });

  describe('onModuleInit', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('should do nothing when app is multitenant', async () => {
      const createStrategySpy = jest.spyOn(service, 'createStrategy').mockReturnValue(Promise.resolve({}));
      service.isMultitenant = true;
      service.onModuleInit();
      expect(createStrategySpy).toHaveBeenCalledTimes(0);
    });

    it('should call createStrategy when app is single tenant', async () => {
      const spy = jest.spyOn(service, 'createStrategy').mockReturnValue(Promise.resolve({}));
      service.isMultitenant = false;
      service.onModuleInit();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('isExpired', () => {
    it('should return false if no expiredAt token', () => {
      expect(service.isExpired(null)).toBeFalsy();
    });

    it('should return true if expiresAt time is reach', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1598537591300000);
      expect(service.isExpired(1598537521300)).toBeTruthy();
    });

    it('should return false if expiresAt time is not reach', () => {
      jest.spyOn(Date, 'now').mockReturnValue(1598537521300000);
      expect(service.isExpired(1598537591300)).toBeFalsy();
    });
  });

  describe('login', () => {
    let res, req, next, params;
    const IssuerMock = MOCK_ISSUER_INSTANCE;
    beforeEach(() => {
      req = createRequest();
      req.session = {};
      res = createResponse();
      next = jest.fn();
      params = {};
      service.idpInfos = {
        idpKey: {
          client: MOCK_CLIENT_INSTANCE,
          trustIssuer: MOCK_TRUST_ISSUER,
          tokenStore: new JWKS.KeyStore(),
          strategy: null,
        },
      };
      service.options = MOCK_OIDC_MODULE_OPTIONS;
      service.getIdpInfosKey = jest.fn().mockReturnValue(idpKey);
      // IssuerMock.keystore = jest.fn();
      // jest
      //   .spyOn(Issuer, 'discover')
      //   .mockImplementation(() => Promise.resolve(IssuerMock));
    });

    it('should call passport authenticate for single tenant login', async () => {
      service.strategy = new OidcStrategy(service, idpKey);
      const spy = jest.spyOn(passport, 'authenticate').mockImplementation(() => {
        return (req, res, next) => { };
      });
      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
    });

    it('should call passport authenticate for multitenant login', async () => {
      service.strategy = null;
      params = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };
      const spy = jest.spyOn(passport, 'authenticate').mockImplementation(() => {
        return (req, res, next) => { };
      });
      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
    });

    it('should send a 404 when error in createStrategy', async () => {
      service.strategy = null;
      params = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };

      jest.spyOn(service, 'createStrategy').mockImplementation(() => {
        throw new Error();
      });
      const spy = jest.spyOn(res, 'status');
      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
    });

    it('should return next(err) if authentication through passport returns error', async () => {
      service.strategy = new OidcStrategy(service, idpKey);
      params = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };

      const spy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, options, cb) => {
        cb();
        return (req, res, next) => { };
      });

      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should return next(err) if req.logIn returns error', async () => {
      service.strategy = new OidcStrategy(service, idpKey);
      params = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };

      req.logIn = jest.fn().mockImplementation((user, cb) => {
        cb('error');
      });

      const spy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, options, cb) => {
        const user = {}
        cb(null, user, null);
        return (req, res, next) => { };
      });

      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should return next(err) if logIn returns error', async () => {
      service.strategy = new OidcStrategy(service, idpKey);
      params = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };

      req.logIn = jest.fn().mockImplementation((user, cb) => {
        cb('err');
      });

      const spy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, options, cb) => {
        cb(null, {}, null);
        return (req, res, next) => { };
      });

      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith('err');
    });

    it('should redirect if everything is successful', async () => {
      service.strategy = new OidcStrategy(service, idpKey);
      params = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };

      req.logIn = jest.fn().mockImplementation((user, cb) => {
        cb();
      });

      const spy = jest.spyOn(passport, 'authenticate').mockImplementation((strategy, options, cb) => {
        cb(null, {}, null);
        return (req, res, next) => { };
      });

      const spyRes = jest.spyOn(res, 'redirect');

      await service.login(req, res, next, params);
      expect(spy).toHaveBeenCalled();
      expect(spyRes).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    let res, req, params, spyLogout, spyResponse;
    beforeEach(() => {
      req = createRequest();
      res = createResponse();
      params = {};
      service.idpInfos = {
        idpKey: {
          client: MOCK_CLIENT_INSTANCE,
          trustIssuer: MOCK_TRUST_ISSUER,
          tokenStore: new JWKS.KeyStore([]),
          strategy: null,
        },
      };
      service.getIdpInfosKey = jest.fn().mockReturnValue(idpKey);
      service.options = MOCK_OIDC_MODULE_OPTIONS;
      req.logout = jest.fn();
      req.isAuthenticated = jest.fn().mockReturnValue(true);
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

      service.logout(req, res, params);
      expect(spyLogout).toHaveBeenCalled();
    });

    it('should redirect without id_token_hint', done => {
      req.user = {};
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(expect.not.stringContaining('id_token_hint'));
            done();
          });
        }),
      };
      service.logout(req, res, params);
    });

    it('should redirect with id_token_hint', done => {
      req.user = {
        id_token: '123',
      };
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(expect.stringContaining('id_token_hint'));
            done();
          });
        }),
      };
      service.logout(req, res, params);
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
            expect(spyResponse).toHaveBeenCalledWith(expect.stringContaining(mockRedirectLogout));
            done();
          });
        }),
      };
      service.logout(req, res, params);
    });

    it('should redirect on loggedout if no end_session_endpoint found', done => {
      service.idpInfos[idpKey].trustIssuer.metadata.end_session_endpoint = null;

      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith('/loggedout');
            done();
          });
        }),
      };
      service.logout(req, res, params);
    });

    it('should redirect on prefixed loggedout if no end_session_endpoint found', done => {
      service.idpInfos[idpKey].trustIssuer.metadata.end_session_endpoint = null;

      params = {
        tenantId: 'tenant',
        channelType: ChannelType.b2c,
      };
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(`/${params.tenantId}/${params.channelType}/loggedout`);
            done();
          });
        }),
      };
      service.logout(req, res, params);
    });
    it('should redirect on prefixed and suffixed loggedout if query contains tenantId and channelType', done => {
      service.idpInfos[idpKey].trustIssuer.metadata.end_session_endpoint = null;

      params = {
        tenantId: 'tenant',
        channelType: ChannelType.b2c,
      };
      req.query = {
        tenantId: 'tenant',
        channelType: 'b2c',
      };
      (req.session as any) = {
        destroy: jest.fn().mockImplementation(callback => {
          callback().then(() => {
            expect(spyResponse).toHaveBeenCalledWith(
              `/${params.tenantId}/${params.channelType}/loggedout?tenantId=${req.query.tenantId}&channelType=${req.query.channelType}`,
            );
            done();
          });
        }),
      };
      service.logout(req, res, params);
    });
  });

  describe('loggedOut', () => {
    let req, res, params;
    beforeEach(() => {
      req = createRequest({
        query: {
          tenantId: 'tenantId',
          channelType: 'b2c'
        },
        session: {}
      });
      res = createResponse();
      params = {};
    });

    it('should send message file and redirect to login page', () => {
      const res = createResponse();
      res.send = jest.fn();
      const spy = jest.spyOn(res, 'redirect');
      service.loggedOut(req, res, params);
      expect(spy).toHaveBeenCalledWith('/message');
      expect(req.session.msgPageOpts).toBeTruthy();
    });

    it('should send message file', () => {
      options.postLogoutRedirectUri = 'redirectUri';
      const res = createResponse();
      res.send = jest.fn();
      const spy = jest.spyOn(res, 'redirect');
      service.loggedOut(req, res, params);
      expect(spy).toHaveBeenCalledWith('/message');
      expect(req.session.msgPageOpts).toBeTruthy();
    });

    it('should send message file', () => {
      options.postLogoutRedirectUri = '/redirectUri';
      const res = createResponse();
      res.send = jest.fn();
      const spy = jest.spyOn(res, 'redirect');
      service.loggedOut(req, res, params);
      expect(spy).toHaveBeenCalledWith('/message');
      expect(req.session.msgPageOpts).toBeTruthy();
    });
  });

  describe('refreshTokens', () => {
    beforeEach(() => {
      service.options['b2c'] = {
        clientMetadata: {
          client_id: '123',
          client_secret: '456',
        },
      };
      service.options['b2e'] = {
        clientMetadata: {
          client_id: '123',
          client_secret: '456',
        },
      };
      options.defaultHttpOptions = {
        timeout: 0,
      };
    });
    it('should return 200 if no token to refresh', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {},
        userinfo: {},
      };
      req.isAuthenticated = jest.fn().mockReturnValue(true);
      const res = createResponse();
      res.status = (() => {
        return { send: jest.fn() };
      }) as any;
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if token is valid', () => {
      const req = createRequest();
      req.user = {
        authTokens: {},
        userinfo: {},
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');

      service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if token was refreshed', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          accessToken: 'abc',
          refreshToken: 'def',
          tokenEndpoint: '/token',
          expiresAt: Date.now() / 1000 - 10,
        },
        userinfo: {},
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_in: 300,
          },
        }),
      );

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if token was refreshed for b2c channel', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          accessToken: 'abc',
          refreshToken: 'def',
          tokenEndpoint: '/token',
          expiresAt: Date.now() / 1000 - 10,
        },
        userinfo: { channel: 'b2c' },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_in: 300,
          },
        }),
      );

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if token was refreshed for b2e channel', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          accessToken: 'abc',
          refreshToken: 'def',
          tokenEndpoint: '/token',
          expiresAt: Date.now() / 1000 - 10,
        },
        userinfo: { channel: 'b2e' },
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_in: 300,
          },
        }),
      );

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if valid token was refreshed and result has expires_in', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          expiresAt: Date.now() / 1000 - 10,
          accessToken: 'abc',
          refreshToken: 'def',
          tokenEndpoint: '/token',
        },
        userinfo: {},
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {
            expires_in: 300,
          },
        }),
      );

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 200 if valid token was refreshed and result has no expires_at and expires_in', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          expiresAt: Date.now() / 1000 - 10,
          accessToken: 'abc',
          refreshToken: 'def',
          tokenEndpoint: '/token',
        },
        userinfo: {},
      };
      const res = createResponse();
      res.sendStatus = jest.fn();
      const next = jest.fn();
      const spy = jest.spyOn(res, 'sendStatus');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 200,
          data: {},
        }),
      );

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(200);
    });

    it('should return 401 if token failed to refresh', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          accessToken: 'abc',
          refreshToken: 'def',
          tokenEndpoint: '/token',
          expiresAt: Date.now() / 1000 - 10,
        },
        userinfo: {},
      };
      const res = createResponse();
      res.status = (() => {
        return { send: jest.fn() };
      }) as any;
      const next = jest.fn();
      const spy = jest.spyOn(res, 'status');
      jest.spyOn(axios, 'request').mockReturnValue(
        Promise.resolve({
          status: 401,
          data: {},
        }),
      );

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(401);
    });
    it('should throw an error 401 if no token endpoint', async () => {
      const req = createRequest();
      req.user = {
        authTokens: {
          accessToken: 'abc',
          refreshToken: 'def',
          expiresAt: Date.now() / 1000 - 10,
        },
        userinfo: {},
      };
      const res = createResponse();
      res.status = (() => {
        return { send: jest.fn() };
      }) as any;
      const next = jest.fn();
      const spy = jest.spyOn(res, 'status');

      await service.refreshTokens(req, res, next);
      expect(spy).toHaveBeenCalledWith(401);
    });
  });

  describe('messagePage', () => {
    let req, res;
    beforeEach(() => {
      req = createRequest({
        session: {
          msgPageOpts: ""
        }
      })
      res = createResponse();
    });

    it('should send message page html', async () => {
      const spy = jest.spyOn(res, 'send');
      service.messagePage(req, res);
      expect(spy).toHaveBeenCalled();
    });

  });

  describe('_getPrefix', () => {
    let req, params;
    beforeEach(() => {
      req = createRequest();
      params = {};
    });

    it('should return no prefix', () => {
      expect(service._getPrefix(req, params)).toBe(``);
    });

    it('should get prefix from query', () => {
      req.query = {
        tenantId: 'tenantId',
        channelType: 'channelType'
      };
      expect(service._getPrefix(req, params)).toBe(`/${req.query.tenantId}/${req.query.channelType}`);
    });

    it('should get prefix from channel', () => {
      req.query = {};
      params = {
        tenantId: 'tenantId',
        channelType: 'channelType'
      }
      expect(service._getPrefix(req, params)).toBe(`/${params.tenantId}/${params.channelType}`);
    });
  });
});
