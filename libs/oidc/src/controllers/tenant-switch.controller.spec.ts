import { Test, TestingModule } from '@nestjs/testing';
import { TenantSwitchController } from './tenant-switch.controller';
import { createResponse, createRequest } from 'node-mocks-http';
import { MockOidcService, MOCK_REQUEST } from '../mocks';
import { OidcService } from '../services';

describe('TenantSwitchController', () => {
  let controller: TenantSwitchController;
  let oidcService: OidcService;

  const MOCK_REQ = createRequest(MOCK_REQUEST);
  const MOCK_RES = createResponse();
  const MOCK_PARAMS = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantSwitchController],
      providers: [
        {
          provide: OidcService,
          useValue: MockOidcService,
        },
      ],
    }).compile();

    controller = module.get<TenantSwitchController>(TenantSwitchController);
    oidcService = module.get<OidcService>(OidcService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTenantSwitchWarn', () => {
    it('should call oidcService getTenantSwitchWarn', async () => {
      const spy = jest.spyOn(oidcService, 'tenantSwitchWarn').mockReturnThis();
      await controller.getTenantSwitchWarn(MOCK_RES, MOCK_PARAMS);
      expect(spy).toHaveBeenCalledWith(MOCK_RES, MOCK_PARAMS);
    });
  });

  describe('getTenantSwitch', () => {
    it('should call oidcService getTenantSwitch', async () => {
      const spy = jest.spyOn(oidcService, 'logout').mockReturnThis();
      await controller.getTenantSwitch(MOCK_REQ, MOCK_RES);
      expect(spy).toHaveBeenCalled();
    });
  });
});
