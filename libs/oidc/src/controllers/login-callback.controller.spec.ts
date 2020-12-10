import { Test, TestingModule } from '@nestjs/testing';
import { LoginCallbackController } from './login-callback.controller';
import { createResponse, createRequest } from 'node-mocks-http';
import { MockOidcService, MOCK_REQUEST } from '../mocks';
import { OidcService } from '../services';

describe('LoginCallbackController', () => {
  let controller: LoginCallbackController;
  let oidcService: OidcService;

  const MOCK_REQ = createRequest(MOCK_REQUEST);
  const MOCK_RES = createResponse();
  const MOCK_NEXT = jest.fn();
  const MOCK_PARAMS = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginCallbackController],
      providers: [
        {
          provide: OidcService,
          useValue: MockOidcService,
        },
      ],
    }).compile();

    controller = module.get<LoginCallbackController>(LoginCallbackController);
    oidcService = module.get<OidcService>(OidcService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginCallback', () => {
    it('should call oidcService login', async () => {
      const spy = jest.spyOn(oidcService, 'login').mockReturnThis();
      await controller.loginCallback(MOCK_REQ, MOCK_RES, MOCK_NEXT, MOCK_PARAMS);
      expect(spy).toHaveBeenCalledWith(MOCK_REQ, MOCK_RES, MOCK_NEXT, MOCK_PARAMS);
    });
  });
});
