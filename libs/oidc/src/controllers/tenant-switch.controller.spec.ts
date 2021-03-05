import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse } from 'node-mocks-http';
import { MockOidcService, MOCK_REQUEST } from '../mocks';
import { OidcService, SSRPagesService } from '../services';
import { TenantSwitchController } from './tenant-switch.controller';

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
        SSRPagesService,
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
      const req = {
        session: {},
        query: {
          originalTenant: 'originalTenant',
          originalChannel: 'originalChannel',
          requestedTenant: 'requestedTenant',
          requestedChannel: 'requestedChannel',
        },
      };
      const spy = jest.spyOn(controller['ssrPagesService'], 'build').mockReturnThis();
      await controller.getTenantSwitchWarn(req, MOCK_RES);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('getTenantSwitch', () => {
    it('should call oidcService getTenantSwitch', async () => {
      const spy = jest.spyOn(oidcService, 'logout').mockReturnThis();
      await controller.getTenantSwitch(MOCK_REQ, MOCK_RES, MOCK_PARAMS);
      expect(spy).toHaveBeenCalled();
    });
  });
});
