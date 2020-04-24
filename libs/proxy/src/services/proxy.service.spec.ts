import { Test, TestingModule } from '@nestjs/testing';
import { ProxyService } from './proxy.service';
import { Server } from 'http-proxy';
import { createMock } from '@golevelup/nestjs-testing';
import { PROXY_MODULE_OPTIONS, HTTP_PROXY } from '../proxy.constants';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

class NoopLogger extends Logger {
  log(message: any, context?: string): void {}
  error(message: any, trace?: string, context?: string): void {}
  warn(message: any, context?: string): void {}
}

const services = [
  {
    id: 'test',
    url: 'https://test.io',
  },
];
const mockProxyModuleOptions = {
  services,
};

describe('ProxyService', () => {
  let service: ProxyService;
  let proxy: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HTTP_PROXY,
          useValue: createMock<Server>(),
        },
        {
          provide: PROXY_MODULE_OPTIONS,
          useValue: mockProxyModuleOptions,
        },
      ],
    }).compile();

    module.useLogger(new NoopLogger());

    service = module.get<ProxyService>(ProxyService);
    proxy = module.get<Server>(HTTP_PROXY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('proxyRequest', () => {
    it('should call proxy with just target', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      req.query = {
        target: services[0].url,
      };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res);
      expect(spy).toHaveBeenCalled();
    });

    it('should call proxy with just serviceId', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      req.query = {
        serviceId: services[0].id,
      };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res);
      expect(spy).toHaveBeenCalled();
    });

    it('should call proxy with serviceId + target', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      req.query = {
        serviceId: services[0].id,
        target: 'deep-test',
      };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res);
      expect((spy.mock.calls[0][2] as any).target).toBe(services[0].url);
      expect((spy.mock.calls[0][0] as any).url).toBe('/deep-test');
    });

    it('should not call proxy when no service id nor target', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      const spy = jest.spyOn(res, 'status');
      service.proxyRequest(req, res);
      expect(spy).toHaveBeenCalledWith(500);
    });

    it('should call proxy with token', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      req.query = {
        serviceId: services[0].id,
      };
      req.user = { access_token: 'test' };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res);
      expect((spy.mock.calls[0][2] as any).headers).toHaveProperty(
        'authorization',
      );
    });

    it('should throw an error if error comes from proxy', done => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      req.query = {
        target: services[0].url,
      };

      proxy.web = jest
        .fn()
        .mockImplementation(async (req, res, options, callback) => {
          expect(() => {
            callback({ code: '' });
          }).toThrow();
          done();
        });
      service.proxyRequest(req, res);
    });

    it('should not throw an error if error from proxy is ECONNRESET', done => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      req.query = {
        target: services[0].url,
      };

      proxy.web = jest
        .fn()
        .mockImplementation(async (req, res, options, callback) => {
          expect(() => {
            callback({ code: 'ECONNRESET' });
          }).not.toThrow();
          done();
        });
      service.proxyRequest(req, res);
    });
  });
});

describe('Proxy Service - empty configuration provided', () => {
  const mockProxyModuleOptions = {};
  let service: ProxyService;
  let proxy: Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HTTP_PROXY,
          useValue: createMock<Server>(),
        },
        {
          provide: PROXY_MODULE_OPTIONS,
          useValue: mockProxyModuleOptions,
        },
      ],
    }).compile();

    module.useLogger(new NoopLogger());

    service = module.get<ProxyService>(ProxyService);
    proxy = module.get<Server>(HTTP_PROXY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a 500 if no serviceId found', () => {
    const req = createMock<Request>();
    const res = createMock<Response>();
    req.query = {
      serviceId: services[0].id,
    };

    const spy = jest.spyOn(res, 'status');
    service.proxyRequest(req, res);
    expect(spy).toHaveBeenCalledWith(500);
  });
});