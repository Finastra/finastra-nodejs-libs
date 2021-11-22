import { createMock } from '@golevelup/nestjs-testing';
import { ConsoleLogger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import * as server from 'http-proxy';
import { HTTP_PROXY, PROXY_MODULE_OPTIONS } from '../proxy.constants';
import { ProxyService } from './proxy.service';

class NoopLogger extends ConsoleLogger {
  log(message: any, context?: string): void {}
  error(message: any, trace?: string, context?: string): void {}
  warn(message: any, context?: string): void {}
}

const services = [
  {
    id: 'test',
    url: 'https://test.io/subpath',
  },
];
const mockProxyModuleOptions = {
  services,
};

describe('ProxyService', () => {
  let service: ProxyService;
  let proxy: server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HTTP_PROXY,
          useValue: createMock<server>(),
        },
        {
          provide: PROXY_MODULE_OPTIONS,
          useValue: mockProxyModuleOptions,
        },
      ],
    }).compile();

    module.useLogger(new NoopLogger());

    service = module.get<ProxyService>(ProxyService);
    proxy = module.get<server>(HTTP_PROXY);
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
        target: 'deep-test?query=ok',
      };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res);
      expect((spy.mock.calls[0][2] as any).target).toBe('https://test.io');
      expect((spy.mock.calls[0][0] as any).url).toBe('/subpath/deep-test?query=ok');
    });

    it('should not call proxy when no service id nor target', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      const spy = jest.spyOn(res, 'status');
      service.proxyRequest(req, res);
      expect(spy).toHaveBeenCalledWith(404);
    });

    it('should call proxy with token', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      req.query = {
        serviceId: services[0].id,
      };
      req.user = {
        authTokens: {
          accessToken: 'test',
        },
      };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res);
      expect((spy.mock.calls[0][2] as any).headers).toHaveProperty('authorization');
    });

    it('should send a 500 if error comes from proxy', done => {
      const req = createMock<Request>();
      const res = createMock<Response>();

      req.query = {
        target: services[0].url,
      };

      proxy.web = jest.fn().mockImplementation(async (req, res, options, callback) => {
        callback({ code: '' });
        expect(res.writeHead).toHaveBeenCalledWith(500, {
          'Content-Type': 'text/plain',
        });
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

      proxy.web = jest.fn().mockImplementation(async (req, res, options, callback) => {
        expect(() => {
          callback({ code: 'ECONNRESET' });
        }).not.toThrow();
        done();
      });
      service.proxyRequest(req, res);
    });

    it('should call proxy with token and params', () => {
      const req = createMock<Request>();
      const res = createMock<Response>();
      const MOCK_PARAMS = ['tenant/b2c'];

      req.query = {
        serviceId: services[0].id,
      };
      req.user = {
        authTokens: {
          accessToken: 'test',
        },
      };

      const spy = jest.spyOn(proxy, 'web');
      service.proxyRequest(req, res, MOCK_PARAMS);
      expect((spy.mock.calls[0][2] as any).headers).toHaveProperty('authorization');
    });
  });
});

describe('Proxy Service - empty configuration provided', () => {
  const mockProxyModuleOptions = {};
  let service: ProxyService;
  let proxy: server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProxyService,
        {
          provide: HTTP_PROXY,
          useValue: createMock<server>(),
        },
        {
          provide: PROXY_MODULE_OPTIONS,
          useValue: mockProxyModuleOptions,
        },
      ],
    }).compile();

    module.useLogger(new NoopLogger());

    service = module.get<ProxyService>(ProxyService);
    proxy = module.get<server>(HTTP_PROXY);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a 404 if no serviceId found', () => {
    const req = createMock<Request>();
    const res = createMock<Response>();
    req.query = {
      serviceId: services[0].id,
    };

    const spy = jest.spyOn(res, 'status');
    service.proxyRequest(req, res);
    expect(spy).toHaveBeenCalledWith(404);
  });
});
