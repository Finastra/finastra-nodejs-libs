import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { MOCK_OIDC_MODULE_OPTIONS } from '../mocks';
import { OIDC_MODULE_OPTIONS } from '../oidc.constants';
import { createResponse, createRequest } from 'node-mocks-http';

describe('AuthController', () => {
  let controller: AuthController;

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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('loginCallback', () => {
    it('should call redirect', () => {
      const res = createResponse();
      const spy = jest.spyOn(res, 'redirect');
      controller.loginCallback(null, res);
      expect(spy).toHaveBeenCalledWith('/');
    });
  });
});
