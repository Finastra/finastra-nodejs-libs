import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { MOCK_OIDC_MODULE_OPTIONS } from '../mocks';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';
import { createResponse, createRequest } from 'node-mocks-http';
import { Issuer } from 'openid-client';
import { OidcModuleOptions } from '../interfaces';

describe('AuthController', () => {
  let controller: AuthController;
  let options: OidcModuleOptions;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: OIDC_MODULE_OPTIONS,
          useValue: MOCK_OIDC_MODULE_OPTIONS,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    options = module.get<OidcModuleOptions>(OIDC_MODULE_OPTIONS);
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
      jest.spyOn(Issuer, 'discover').mockReturnValue(
        Promise.resolve({
          metadata: {
            end_session_endpoint: 'http://endpoint.io',
          },
        } as any),
      );
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

    it('should redirect on root if no end_session_endpoint found', done => {
      jest.spyOn(Issuer, 'discover').mockReturnValue(
        Promise.resolve({
          metadata: {},
        } as any),
      );
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
});
