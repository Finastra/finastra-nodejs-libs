import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse } from 'node-mocks-http';
import { AuthMultitenantMultiChannelController } from '.';
import { MockOidcService, MOCK_REQUEST } from '../mocks';
import { OidcService } from '../services';

describe('AuthMultitenantMultiChannelController', () => {
  let controller: AuthMultitenantMultiChannelController;
  let oidcService: OidcService;

  const MOCK_REQ = createRequest(MOCK_REQUEST);
  const MOCK_RES = createResponse();
  const MOCK_NEXT = jest.fn();
  const MOCK_PARAMS = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthMultitenantMultiChannelController],
      providers: [
        {
          provide: OidcService,
          useValue: MockOidcService,
        },
      ],
    }).compile();

    controller = module.get<AuthMultitenantMultiChannelController>(AuthMultitenantMultiChannelController);
    oidcService = module.get<OidcService>(OidcService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('user', () => {
    it('should return userinfo', () => {
      const req = MOCK_REQ;
      expect(controller.user(req)).toBe(req.user['userinfo']);
    });
  });

  describe('login', () => {
    it('should call oidcService login', async () => {
      const spy = jest.spyOn(oidcService, 'login').mockReturnThis();
      await controller.login(MOCK_REQ, MOCK_RES, MOCK_NEXT, MOCK_PARAMS);
      expect(spy).toHaveBeenCalledWith(MOCK_REQ, MOCK_RES, MOCK_NEXT, MOCK_PARAMS);
    });
  });

  describe('logout', () => {
    it('should call oidcService logout', async () => {
      const spy = jest.spyOn(oidcService, 'logout').mockReturnThis();
      await controller.logout(MOCK_REQ, MOCK_RES, MOCK_PARAMS);
      expect(spy).toHaveBeenCalledWith(MOCK_REQ, MOCK_RES, MOCK_PARAMS);
    });
  });

  describe('refreshTokens', () => {
    it('should call oidcService logout', async () => {
      const spy = jest.spyOn(oidcService, 'refreshTokens').mockReturnThis();
      await controller.refreshTokens(MOCK_REQ, MOCK_RES, MOCK_NEXT);
      expect(spy).toHaveBeenCalledWith(MOCK_REQ, MOCK_RES, MOCK_NEXT);
    });
  });

  describe('loggedOut', () => {
    it('should call oidcService logout', async () => {
      const spy = jest.spyOn(oidcService, 'loggedOut').mockReturnThis();
      await controller.loggedOut(MOCK_REQ, MOCK_RES, MOCK_PARAMS);
      expect(spy).toHaveBeenCalledWith(MOCK_REQ, MOCK_RES, MOCK_PARAMS);
    });
  });
});
