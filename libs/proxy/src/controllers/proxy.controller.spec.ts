import { createMock } from '@golevelup/nestjs-testing';
import { ConsoleLogger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createRequest, createResponse } from 'node-mocks-http';
import { ProxyService } from '../services';
import { ProxyController } from './proxy.controller';

class NoopLogger extends ConsoleLogger {
  log(message: any, context?: string): void {}
  error(message: any, trace?: string, context?: string): void {}
  warn(message: any, context?: string): void {}
}

describe('ProxyController', () => {
  let controller: ProxyController;
  let service: ProxyService;
  const MOCK_PARAMS = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
      providers: [
        {
          provide: ProxyService,
          useValue: createMock<ProxyService>(),
        },
      ],
    }).compile();

    module.useLogger(new NoopLogger());

    controller = module.get<ProxyController>(ProxyController);
    service = module.get<ProxyService>(ProxyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('proxy', () => {
    it('should call proxy service', () => {
      const res = createResponse();
      const req = createRequest();
      const spy = jest.spyOn(service, 'proxyRequest');
      controller.proxy(res, req, MOCK_PARAMS);
      expect(spy).toHaveBeenCalled();
    });

    it('should send a 500 if error is thrown from proxy service', () => {
      const res = createResponse();
      const req = createRequest();
      jest.spyOn(service, 'proxyRequest').mockImplementation(() => {
        throw new Error();
      });
      const spy = jest.spyOn(res, 'status');
      controller.proxy(res, req, MOCK_PARAMS);
      expect(spy).toHaveBeenCalledWith(500);
    });
  });
});
