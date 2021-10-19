import { Test, TestingModule } from '@nestjs/testing';
import * as server from 'http-proxy';
import { createRequest } from 'node-mocks-http';
import { HTTP_PROXY } from './proxy.constants';
import { ProxyModule } from './proxy.module';

describe('ProxyModule', () => {
  describe('register sync', () => {
    let module: TestingModule;
    let proxy;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [ProxyModule.forRoot({})],
      }).compile();
      proxy = module.get<server>(HTTP_PROXY);
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });

    describe('proxyFactory', () => {
      describe('on ProxyReq', () => {
        it('should not do anything if no body in req', () => {
          const proxyReq = createRequest();
          const req = createRequest();
          proxyReq.getHeader = header => header;
          proxyReq.write = jest.fn();
          proxyReq.protocol = 'http:';
          proxyReq.host = 'localhost';
          const spy = jest.spyOn(proxyReq, 'write');
          proxy.emit('proxyReq', proxyReq, req);
          expect(spy).not.toHaveBeenCalled();
        });

        it('should not do anything if no contentType', () => {
          const proxyReq = createRequest();
          const req = createRequest();
          const body = { prop: 'test' };
          req.body = body;
          proxyReq.getHeader = header => header;
          proxyReq.write = jest.fn();
          proxyReq.protocol = 'http:';
          proxyReq.host = 'localhost';
          const spy = jest.spyOn(proxyReq, 'write');
          proxy.emit('proxyReq', proxyReq, req);
          expect(spy).not.toHaveBeenCalled();
        });

        it('should stringify body if content type is json', () => {
          const proxyReq = createRequest();
          proxyReq.getHeader = header => 'application/json';
          proxyReq.write = jest.fn();
          proxyReq.setHeader = jest.fn();
          proxyReq.protocol = 'http:';
          proxyReq.host = 'localhost';

          const req = createRequest();
          const body = { prop: 'test' };
          req.body = body;

          const spy = jest.spyOn(proxyReq, 'write');
          proxy.emit('proxyReq', proxyReq, req);
          expect(spy).toHaveBeenCalledWith('{"prop":"test"}');
        });

        it('should stringify body if content type is x-www-form-urlencoded', () => {
          const proxyReq = createRequest();
          proxyReq.getHeader = header => 'application/x-www-form-urlencoded';
          proxyReq.write = jest.fn();
          proxyReq.setHeader = jest.fn();
          proxyReq.protocol = 'http:';
          proxyReq.host = 'localhost';

          const req = createRequest();
          const body = { prop: 'test' };
          req.body = body;

          const spy = jest.spyOn(proxyReq, 'write');
          proxy.emit('proxyReq', proxyReq, req);
          expect(spy).toHaveBeenCalledWith('prop=test');
        });
      });
    });
  });

  describe('register async', () => {
    let module: TestingModule;

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          ProxyModule.forRootAsync({
            useFactory: async () => ({}),
          }),
        ],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });

  describe('register async', () => {
    let module: TestingModule;

    class ProxyModuleConfig {
      createModuleConfig() {
        return {};
      }
    }

    beforeEach(async () => {
      module = await Test.createTestingModule({
        imports: [
          ProxyModule.forRootAsync({
            useClass: ProxyModuleConfig,
          }),
        ],
      }).compile();
    });

    it('should be defined', () => {
      expect(module).toBeDefined();
    });
  });
});
